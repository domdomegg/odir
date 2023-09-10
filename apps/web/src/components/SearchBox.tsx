import AsyncSelect from 'react-select/async';
import AsyncCreatableSelect from 'react-select/async-creatable';
import pDebounce from 'p-debounce';
import { navigate } from 'gatsby';
import { Ref } from 'react';
import Select from 'react-select/dist/declarations/src/Select';
import { GroupBase } from 'react-select/dist/declarations/src';
import { SearchRequest, SearchResponse } from '../helpers/generated-api-client';
import { useRawReq } from '../helpers/networking';
import { ENTITY_PREFIX } from '../helpers/entityPrefix';

export type NewValue = { value: string, __isNew__: true };

export type SelectRef<T = SearchResponse['results'][number]> = Ref<Select<T, false, GroupBase<T>>>;

export type SearchBoxProps<T> = {
  placeholder?: string,
  autoFocus?: boolean,
  className?: string,
  selectRef?: SelectRef<T>,
} & ({
  createable: true,
  getItems: (query: string) => Promise<T[]>,
  onSelect: (item: T | NewValue) => void
  formatOptionLabel: (item: T | NewValue) => React.ReactNode,
} | {
  createable?: false,
  getItems: (query: string) => Promise<T[]>,
  onSelect: (item: T) => void
  formatOptionLabel: (item: T) => React.ReactNode,
});

const DEFAULTS = {
  types: ['person', 'team'] satisfies SearchRequest['types'],
  autoFocus: false,
  createable: false,
  className: '',
};

export const SearchBox = <T = SearchResponse['results'][number],>({
  getItems,
  onSelect,
  formatOptionLabel,
  placeholder,
  autoFocus = DEFAULTS.autoFocus,
  createable = DEFAULTS.createable,
  className = DEFAULTS.className,
  selectRef,
}: SearchBoxProps<T>): React.ReactElement => {
  const SelectComponent = createable ? AsyncCreatableSelect : AsyncSelect;

  return (
    <SelectComponent<T>
      classNames={{
        control: () => `${className} !cursor-text !rounded-none !outline-none focus-within:!shadow focus-within:!border-transparent focus-within:!ring-2 ring-gray-800`,
        option: ({ isFocused }) => (isFocused ? 'bg-primary-200' : ''),
        menu: () => '!rounded-none'
      }}
      loadOptions={pDebounce(getItems, 100)}
      onChange={(v) => { if (v) { onSelect(v); } }}
      formatOptionLabel={formatOptionLabel}
      value={null}
      placeholder={placeholder}
      noOptionsMessage={({ inputValue }) => (inputValue ? 'No results' : 'Start typing to search')}
      autoFocus={autoFocus}
      components={{
        DropdownIndicator: null,
      }}
      ref={selectRef}
    />
  );
};

export const renderSearchResult = (item: SearchResponse['results'][number] | NewValue): React.ReactNode => {
  if ('__isNew__' in item) {
    return `Create "${item.value}"`;
  }

  return (
    <div>
      <div>{item.title}</div>
      {item.subtitle && <div className="text-xs">{item.subtitle.map((fragment) => <span className={fragment.highlight ? 'bg-yellow-400' : ''}>{fragment.text}</span>)}</div>}
    </div>
  );
};

export type EntitySearchBoxProps = {
  onSelectExisting?: (item: SearchResponse['results'][number]) => void,
  onAfterCreate?: (itemId: string) => void,
  types?: SearchRequest['types'],
  placeholder?: string,
  autoFocus?: boolean,
  createable?: boolean,
  className?: string
  // TODO: handle personId in the idContext
  idContext?: { teamId?: string },
  excludedIds?: Set<string>,
  selectRef?: SelectRef,
};

export const EntitySearchBox: React.FC<EntitySearchBoxProps> = ({
  onSelectExisting = ({ slug }) => navigate(`${ENTITY_PREFIX}${slug}`),
  onAfterCreate = (id) => navigate(`${ENTITY_PREFIX}${id}`),
  types = DEFAULTS.types,
  placeholder,
  autoFocus = DEFAULTS.autoFocus,
  createable = DEFAULTS.createable,
  className = DEFAULTS.className,
  idContext = {},
  excludedIds = new Set(),
  selectRef,
}) => {
  const req = useRawReq();

  if (createable && types.length !== 1) {
    throw new Error(`Cannot render creatable EntitySearchBox with multiple types (${JSON.stringify(types)})`);
  }

  return (
    <SearchBox
      getItems={async (query) => {
        const res = await req('post /admin/search', { query, types });
        return res.data.results.filter((r) => !excludedIds.has(r.id));
      }}
      onSelect={async (selectedValue: NewValue | SearchResponse['results'][number]) => {
        if ('__isNew__' in selectedValue) {
          switch (types[0]) {
            case 'person': {
              const personId = (await req('post /admin/persons', { name: selectedValue.value })).data;
              if (idContext.teamId) {
                await req('post /admin/relations', { type: 'MEMBER_OF', childId: personId, parentId: idContext.teamId });
              }
              onAfterCreate(personId);
              break;
            }
            case 'team': {
              const teamId = (await req('post /admin/teams', { name: selectedValue.value })).data;
              if (idContext.teamId) {
                await req('post /admin/relations', { type: 'PART_OF', childId: teamId, parentId: idContext.teamId });
              }
              onAfterCreate(teamId);
              break;
            }
            default: {
              const type: never = types[0];
              throw new Error(`Unknown type to create ${type}`);
            }
          }
        } else {
          onSelectExisting(selectedValue);
        }
      }}
      formatOptionLabel={renderSearchResult}
      placeholder={placeholder ?? `Search ${pluraliseAndJoin(types)}...`}
      autoFocus={autoFocus}
      createable={createable}
      className={className}
      selectRef={selectRef}
    />
  );
};

const CUSTOM_PLURALS: Record<string, string | undefined> = {
  person: 'people'
};

/** @example pluraliseAndJoin(["person", "team"]) -> "people and teams" */
const pluraliseAndJoin = (terms: string[]): string => {
  if (terms.length === 0) {
    throw new Error('pluraliseAndJoin: received no terms');
  }

  const pluralised = terms.map((t) => CUSTOM_PLURALS[t] ?? `${t}s`);
  // TODO: handle >2 terms by combining with commas first then 'and'
  return pluralised.join(' and ');
};
