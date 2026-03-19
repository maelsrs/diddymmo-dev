import { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchBar.module.css';

export default function SearchBar() {
  const [city, setCity] = useState('');
  const [type, setType] = useState('acheter');
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/${type}?city=${encodeURIComponent(city)}`);
  };

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder="Ville, quartier..."
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className={styles.input}
        aria-label="Rechercher une ville ou un quartier"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className={styles.select}
        aria-label="Type de bien"
      >
        <option value="acheter">Acheter</option>
        <option value="louer">Louer</option>
      </select>
      <button
        onClick={handleSearch}
        className={styles.button}
        aria-label="Rechercher"
      >
        <Search size={20} />
      </button>
    </div>
  );
}
