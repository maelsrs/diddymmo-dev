import { Camera, BarChart3, Handshake } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import styles from './Sell.module.css';

const steps = [
  {
    icon: BarChart3,
    title: 'Estimation',
    description: 'On évalue votre bien gratuitement, à partir des transactions récentes dans votre quartier.',
  },
  {
    icon: Camera,
    title: 'Mise en ligne',
    description: 'Photos professionnelles, rédaction de l\'annonce, diffusion sur les plateformes.',
  },
  {
    icon: Handshake,
    title: 'Vente',
    description: 'Organisation des visites, négociation, suivi administratif jusqu\'à la signature.',
  },
];

export default function Sell() {
  const ref = useScrollAnimation();

  return (
    <div className={styles.page} ref={ref}>
      <div className={styles.hero}>
        <div className="container">
          <h1 className={`${styles.title} fade-up`}>Vendre votre bien</h1>
          <p className={`${styles.subtitle} fade-up`}>
            On prend en charge la vente de A à Z. Vous êtes informé à chaque étape.
          </p>
          <div className="fade-up">
            <Button variant="primary" size="lg">
              Demander une estimation
            </Button>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <h2 className={`${styles.sectionTitle} fade-up`}>Comment ça se passe</h2>
          <div className={styles.grid}>
            {steps.map((step, stepIndex) => (
              <Card key={step.title} className="fade-up">
                <div className={styles.cardContent}>
                  <div className={styles.stepNumber}>{String(stepIndex + 1).padStart(2, '0')}</div>
                  <div className={styles.iconWrapper}>
                    <step.icon size={24} />
                  </div>
                  <h3 className={styles.cardTitle}>{step.title}</h3>
                  <p className={styles.cardDesc}>{step.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
