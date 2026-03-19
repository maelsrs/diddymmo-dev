import SearchBar from '../ui/SearchBar';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import styles from './Hero.module.css';

export default function Hero() {
  const ref = useScrollAnimation();

  return (
    <section className={styles.hero} ref={ref}>
      <div className={`container ${styles.content}`}>
        <div className={styles.text}>
          <h1 className={`${styles.title} fade-up`}>
            Achat, vente, location — on s'occupe de tout.
          </h1>
          <p className={`${styles.subtitle} fade-up`}>
            Recherchez parmi nos biens disponibles dans toute la France.
          </p>
          <div className="fade-up">
            <SearchBar />
          </div>
        </div>
      </div>
    </section>
  );
}
