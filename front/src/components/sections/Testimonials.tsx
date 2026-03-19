import { Star } from 'lucide-react';
import Card from '../ui/Card';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import styles from './Testimonials.module.css';

const testimonials = [
  {
    name: 'Camille R.',
    context: 'Achat T3, Lyon',
    stars: 5,
    text: "On cherchait depuis 6 mois. Notre conseiller nous a proposé un bien qui n'était pas encore publié. Signé en 3 semaines.",
  },
  {
    name: 'Julien & Anaïs',
    context: 'Vente maison, Nantes',
    stars: 5,
    text: "Vendu en 45 jours, au prix demandé. Le suivi était clair du début à la fin, on savait toujours où on en était.",
  },
  {
    name: 'Rachid M.',
    context: 'Location, Marseille',
    stars: 4,
    text: "Appart trouvé en une semaine. Pas beaucoup de choix dans le 7ème mais le service était réactif.",
  },
];

export default function Testimonials() {
  const ref = useScrollAnimation();

  return (
    <section className="section" ref={ref}>
      <div className="container">
        <h2 className={`${styles.title} fade-up`}>Avis clients</h2>

        <div className={styles.grid}>
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="fade-up">
              <div className={styles.cardContent}>
                <div className={styles.stars}>
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      size={14}
                      fill={starIndex < testimonial.stars ? 'var(--accent)' : 'none'}
                      color={starIndex < testimonial.stars ? 'var(--accent)' : '#c5ced8'}
                    />
                  ))}
                </div>
                <p className={styles.text}>{testimonial.text}</p>
                <div className={styles.author}>
                  <span className={styles.name}>{testimonial.name}</span>
                  <span className={styles.context}>{testimonial.context}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
