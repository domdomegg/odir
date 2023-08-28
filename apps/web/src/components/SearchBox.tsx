import AsyncSelect from 'react-select/async';
import pDebounce from 'p-debounce';

export interface SearchBoxProps<T> {
  getItems: (query: string) => Promise<T[]>,
  onSelect: (item: T) => void
  formatOptionLabel: (item: T) => React.ReactNode,
  placeholder?: string,
}

export const SearchBox = <T,>({
  getItems, onSelect, formatOptionLabel, placeholder
}: SearchBoxProps<T>): React.ReactNode => {
  return (
    <AsyncSelect<T>
      loadOptions={pDebounce(getItems, 100)}
      onChange={(v) => { if (v) { onSelect(v); } }}
      formatOptionLabel={formatOptionLabel}
      value={null}
      placeholder={placeholder}
      noOptionsMessage={({ inputValue }) => (inputValue ? 'No results' : 'Start typing to search')}
    />
  );
};
