import AsyncSelect from 'react-select/async';
import AsyncCreatableSelect from 'react-select/async-creatable';
import pDebounce from 'p-debounce';
import { SearchResponse } from '../helpers/generated-api-client';

export type NewValue = { value: string, __isNew__: true };

export type SearchBoxProps<T> = {
  getItems: (query: string) => Promise<T[]>,
  onSelect: (item: T | NewValue) => void
  formatOptionLabel: (item: T | NewValue) => React.ReactNode,
  placeholder?: string,
  autoFocus?: boolean,
  createable: true,
} | {
  getItems: (query: string) => Promise<T[]>,
  onSelect: (item: T) => void
  formatOptionLabel: (item: T) => React.ReactNode,
  placeholder?: string,
  autoFocus?: boolean,
  createable?: false,
};

export const SearchBox = <T = SearchResponse['results'][number],>({
  getItems, onSelect, formatOptionLabel, placeholder, autoFocus, createable
}: SearchBoxProps<T>): React.ReactNode => {
  const SelectComponent = createable ? AsyncCreatableSelect : AsyncSelect;

  return (
    <SelectComponent<T>
      loadOptions={pDebounce(getItems, 100)}
      onChange={(v) => { if (v) { onSelect(v); } }}
      formatOptionLabel={formatOptionLabel}
      value={null}
      placeholder={placeholder}
      noOptionsMessage={({ inputValue }) => (inputValue ? 'No results' : 'Start typing to search')}
      autoFocus={autoFocus}
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
