import { nationIntro } from "@/lib/data";
import PlaceholderImage from "./PlaceholderImage";
import styles from "./IntroSection.module.css";

export default function IntroSection() {
  return (
    <div className={styles.intro}>
      <div className={styles.cover}>
        <PlaceholderImage
          src={nationIntro.cover}
          alt="小人国封面"
          label="小人国封面占位"
        />
      </div>

      <h2 className={styles.title}>{nationIntro.title}</h2>
      <p className={styles.subtitle}>{nationIntro.subtitle}</p>

      <div className={styles.paragraphs}>
        {nationIntro.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <ul className={styles.facts}>
        {nationIntro.facts.map((fact, index) => (
          <li key={index} className={styles.fact}>
            <span className={styles.factLabel}>{fact.label}</span>
            <span className={styles.factValue}>{fact.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
