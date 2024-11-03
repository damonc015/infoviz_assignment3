import styles from "./page.module.css";
import Container from "../components/Container";


export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>       
        <Container/>
        {/* <LineChart data={{
  "California": [10, 12, 15, 18, 20],
  "New York": [11, 13, 14, 16, 19]}}/> */}
      </main>
      <footer className={styles.footer}>
      </footer>
    </div>
  );
}
