interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  label = "Search",
}: SearchBarProps) {
  return (
    <div className="search-wrap">
      <label className="search-label">{label}</label>
      <input
        className="input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
