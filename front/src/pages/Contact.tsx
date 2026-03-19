import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import styles from './Contact.module.css';

export default function Contact() {
  const ref = useScrollAnimation();

  return (
    <div className={styles.page} ref={ref}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={`${styles.title} fade-up`}>Contact</h1>
          <p className={`${styles.subtitle} fade-up`}>
            Pour toute question ou demande d'estimation, contactez-nous par téléphone, email ou via le formulaire.
          </p>
        </div>
      </div>

      <section className="section">
        <div className={`container ${styles.grid}`}>
          <div className={`${styles.info} fade-up`}>
            <h2 className={styles.infoTitle}>Nos coordonnées</h2>

            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <div className={styles.iconWrapper}>
                  <Phone size={20} />
                </div>
                <div>
                  <p className={styles.contactLabel}>Téléphone</p>
                  <p className={styles.contactValue}>01 23 45 67 89</p>
                </div>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.iconWrapper}>
                  <Mail size={20} />
                </div>
                <div>
                  <p className={styles.contactLabel}>Email</p>
                  <p className={styles.contactValue}>contact@diddymo.fr</p>
                </div>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.iconWrapper}>
                  <MapPin size={20} />
                </div>
                <div>
                  <p className={styles.contactLabel}>Adresse</p>
                  <p className={styles.contactValue}>12 Rue de la Paix, 75002 Paris</p>
                </div>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.iconWrapper}>
                  <Clock size={20} />
                </div>
                <div>
                  <p className={styles.contactLabel}>Horaires</p>
                  <p className={styles.contactValue}>Lun–Ven : 9h–19h / Sam : 10h–17h</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.formWrapper} fade-up`}>
            <h2 className={styles.infoTitle}>Envoyez-nous un message</h2>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="name" className={styles.label}>Nom</label>
                  <input id="name" type="text" placeholder="Votre nom" className={styles.input} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="email" className={styles.label}>Email</label>
                  <input id="email" type="email" placeholder="votre@email.fr" className={styles.input} />
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="subject" className={styles.label}>Sujet</label>
                <input id="subject" type="text" placeholder="Le sujet de votre message" className={styles.input} />
              </div>
              <div className={styles.field}>
                <label htmlFor="message" className={styles.label}>Message</label>
                <textarea id="message" rows={6} placeholder="Votre message..." className={styles.textarea} />
              </div>
              <button type="submit" className={styles.submitBtn}>
                Envoyer
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
