import SmokePurifierPage from './SmokePurifierPage';

interface LocalizedSmokePurifierProps {
  lang: 'it' | 'en' | 'fr' | 'es' | 'de';
}

const LocalizedSmokePurifier = ({ lang }: LocalizedSmokePurifierProps) => {
  return <SmokePurifierPage lang={lang} />;
};

export default LocalizedSmokePurifier;
