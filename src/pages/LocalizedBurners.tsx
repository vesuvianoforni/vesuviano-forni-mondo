import BurnersPage from './BurnersPage';

interface LocalizedBurnersProps {
  lang: 'it' | 'en' | 'fr' | 'es' | 'de';
}

const LocalizedBurners = ({ lang }: LocalizedBurnersProps) => {
  return <BurnersPage lang={lang} />;
};

export default LocalizedBurners;
