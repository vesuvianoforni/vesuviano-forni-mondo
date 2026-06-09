import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import Header from '@/components/Header';
import RouteSEO from '@/components/RouteSEO';

import AIChatWidget from '@/components/chat/AIChatWidget';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  lang: string;
}

const LocalizedUsefulInfo = ({ lang }: Props) => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    loadLanguage(lang);
  }, [lang, i18n]);

  const content = {
    it: {
      title: "Informazioni Utili",
      subtitle: "Tutto quello che devi sapere per installare e utilizzare il tuo forno Vesuviano",
      lifting: {
        title: "Sollevamento e Rimozione",
        items: [
          "Il forno deve essere sollevato e spostato con l'aiuto di un carrello elevatore o una carriola da personale formato e istruito sulle procedure di sicurezza.",
          "Il forno deve essere posizionato su una piattaforma ben livellata. Non è necessario fissarlo alla fondazione."
        ]
      },
      chimney: {
        title: "Evacuazione dei Fumi",
        intro: "Il collegamento del forno alla canna fumaria viene effettuato tramite tubi che devono essere conformi alle seguenti condizioni:",
        items: [
          "Devono essere prodotti con materiali in grado di resistere al calore dei fumi e alle possibili accensioni.",
          "I collegamenti devono essere ben sigillati e i materiali utilizzati devono resistere al calore e alla corrosione.",
          "Devono essere facilmente visibili, facili da smontare e montare, e consentire l'espansione termica.",
          "Un tratto di tubo verticale con lunghezza almeno pari al doppio del diametro dell'apertura della canna fumaria deve essere installato all'uscita del forno.",
          "Dopo il tratto verticale, è possibile installare una sezione orizzontale con un'inclinazione di almeno il 3%. La lunghezza di questa sezione non deve superare l'altezza utile della canna fumaria.",
          "Il cambio di direzione è possibile in non più di 3 punti, incluso l'ingresso della canna fumaria.",
          "Le curve non devono avere un angolo superiore a 90 gradi.",
          "Il diametro del tubo deve rimanere costante lungo tutta la lunghezza."
        ]
      },
      heating: {
        title: "Riscaldamento Iniziale",
        intro: "Il riscaldamento iniziale deve essere effettuato con molta attenzione, aumentando gradualmente la temperatura. Di solito si svolge in 2-3 giorni perché l'umidità deve essere eliminata dalla camera di cottura e dallo strato isolante.",
        warning: "Aumentare bruscamente la temperatura in questo periodo può portare alla formazione di crepe sulla base e sulla cupola.",
        waterWarning: "Durante il periodo di riscaldamento iniziale, gocce d'acqua possono fuoriuscire dal forno, poiché è un periodo di asciugatura intensiva. Per questo motivo, non è consigliato posizionare dispositivi elettrici e cavi in questa zona.",
        tabs: {
          wood: "Forni a Legna",
          gas: "Forni a Gas",
          mix: "Forni Legna/Gas (MIX)"
        }
      },
      gasWarning: "Non installare la porta quando il bruciatore a gas è in funzione. Il forno può essere chiuso solo quando il bruciatore a gas è spento – di solito a fine giornata lavorativa."
    },
    en: {
      title: "Useful Information",
      subtitle: "Everything you need to know to install and use your Vesuviano oven",
      lifting: {
        title: "Lifting and Removal",
        items: [
          "The oven has to be lifted and moved with the help of a forklift or wheelbarrow by equipped and instructed in safety procedures personnel.",
          "The oven has to be placed on a well levelled platform. It is not necessary to be fixed to the foundation."
        ]
      },
      chimney: {
        title: "Leading Smoke Gases Away",
        intro: "Connecting the oven into the chimney is done by chimney pipes which have to be in conformity with the following conditions:",
        items: [
          "They have to be produced from materials made to endure the heat of the smoke gases and the possible delays.",
          "The connections have to be well sealed and the used materials have to endure heat and corrosion.",
          "They have to be easily visible, easy for dismantling and assembling, and provide a possibility for thermal expansion.",
          "A piece of vertical pipe with a length at least twice the diameter of the chimney's opening has to be installed at the outlet of the oven.",
          "After the piece of vertical pipe, a horizontal section with an inclination of at least 3% can be installed. The length of this section does not have to exceed the useful height of the chimney.",
          "The change of direction is possible in no more than 3 places, including the chimney's inlet.",
          "The bends must not have an angle more than 90 degrees.",
          "The pipe diameter along the whole length has to be permanent."
        ]
      },
      heating: {
        title: "Initial Heating",
        intro: "The initial heating has to be carried out very carefully, gradually increasing the temperature and usually it is performed for 2–3 days because the moisture has to be separated from the baking chamber and from the isolation layer.",
        warning: "Sharply increasing the temperature in this period can lead to formation of cracks on the foundation and the cupola.",
        waterWarning: "Usually, in the period of initial heating, drops of water start leaking from the oven, because this is a period of intensive drying. Taking this into consideration, electric devices and cables are not recommended to be placed in this zone.",
        tabs: {
          wood: "Wood Ovens",
          gas: "Gas Ovens",
          mix: "Wood/Gas (MIX) Ovens"
        }
      },
      gasWarning: "Do not install the door when the gas burner is working. The oven can be closed only when the gas burner is switched off – usually at the end of the working day."
    },
    fr: {
      title: "Informations Utiles",
      subtitle: "Tout ce que vous devez savoir pour installer et utiliser votre four Vesuviano",
      lifting: {
        title: "Levage et Déplacement",
        items: [
          "Le four doit être soulevé et déplacé à l'aide d'un chariot élévateur ou d'une brouette par du personnel formé et instruit aux procédures de sécurité.",
          "Le four doit être placé sur une plateforme bien nivelée. Il n'est pas nécessaire de le fixer à la fondation."
        ]
      },
      chimney: {
        title: "Évacuation des Fumées",
        intro: "Le raccordement du four à la cheminée se fait par des tuyaux de cheminée qui doivent être conformes aux conditions suivantes :",
        items: [
          "Ils doivent être fabriqués à partir de matériaux capables de résister à la chaleur des fumées.",
          "Les raccords doivent être bien étanches et les matériaux utilisés doivent résister à la chaleur et à la corrosion.",
          "Ils doivent être facilement visibles, faciles à démonter et à assembler, et permettre la dilatation thermique.",
          "Un tronçon de tuyau vertical d'une longueur au moins égale au double du diamètre de l'ouverture de la cheminée doit être installé à la sortie du four.",
          "Après le tronçon vertical, une section horizontale avec une inclinaison d'au moins 3% peut être installée.",
          "Le changement de direction est possible en 3 points maximum, y compris l'entrée de la cheminée.",
          "Les coudes ne doivent pas avoir un angle supérieur à 90 degrés.",
          "Le diamètre du tuyau doit rester constant sur toute la longueur."
        ]
      },
      heating: {
        title: "Chauffage Initial",
        intro: "Le chauffage initial doit être effectué très soigneusement, en augmentant progressivement la température. Il se déroule généralement sur 2 à 3 jours.",
        warning: "Augmenter brusquement la température durant cette période peut entraîner la formation de fissures sur la base et la coupole.",
        waterWarning: "Pendant la période de chauffage initial, des gouttes d'eau peuvent s'écouler du four. Il est déconseillé de placer des appareils électriques et des câbles dans cette zone.",
        tabs: {
          wood: "Fours à Bois",
          gas: "Fours à Gaz",
          mix: "Fours Bois/Gaz (MIX)"
        }
      },
      gasWarning: "Ne pas installer la porte lorsque le brûleur à gaz fonctionne. Le four ne peut être fermé que lorsque le brûleur est éteint."
    },
    es: {
      title: "Información Útil",
      subtitle: "Todo lo que necesitas saber para instalar y usar tu horno Vesuviano",
      lifting: {
        title: "Levantamiento y Traslado",
        items: [
          "El horno debe ser levantado y movido con la ayuda de una carretilla elevadora o carretilla por personal capacitado en procedimientos de seguridad.",
          "El horno debe colocarse sobre una plataforma bien nivelada. No es necesario fijarlo a la base."
        ]
      },
      chimney: {
        title: "Evacuación de Humos",
        intro: "La conexión del horno a la chimenea se realiza mediante tubos que deben cumplir las siguientes condiciones:",
        items: [
          "Deben estar fabricados con materiales capaces de soportar el calor de los humos.",
          "Las conexiones deben estar bien selladas y los materiales deben resistir el calor y la corrosión.",
          "Deben ser fácilmente visibles, fáciles de desmontar y montar, y permitir la expansión térmica.",
          "Un tramo de tubo vertical con una longitud al menos el doble del diámetro de la apertura debe instalarse a la salida del horno.",
          "Después del tramo vertical, se puede instalar una sección horizontal con una inclinación de al menos el 3%.",
          "El cambio de dirección es posible en no más de 3 puntos, incluyendo la entrada de la chimenea.",
          "Las curvas no deben tener un ángulo superior a 90 grados.",
          "El diámetro del tubo debe permanecer constante en toda su longitud."
        ]
      },
      heating: {
        title: "Calentamiento Inicial",
        intro: "El calentamiento inicial debe realizarse con mucho cuidado, aumentando gradualmente la temperatura. Generalmente se realiza durante 2-3 días.",
        warning: "Aumentar bruscamente la temperatura puede provocar grietas en la base y la cúpula.",
        waterWarning: "Durante el calentamiento inicial, pueden salir gotas de agua del horno. No se recomienda colocar dispositivos eléctricos y cables en esta zona.",
        tabs: {
          wood: "Hornos de Leña",
          gas: "Hornos de Gas",
          mix: "Hornos Leña/Gas (MIX)"
        }
      },
      gasWarning: "No instalar la puerta cuando el quemador de gas está funcionando. El horno solo puede cerrarse cuando el quemador está apagado."
    },
    de: {
      title: "Nützliche Informationen",
      subtitle: "Alles, was Sie über die Installation und Nutzung Ihres Vesuviano-Ofens wissen müssen",
      lifting: {
        title: "Anheben und Transport",
        items: [
          "Der Ofen muss mit Hilfe eines Gabelstaplers oder einer Schubkarre von geschultem Personal angehoben und bewegt werden.",
          "Der Ofen muss auf einer gut nivellierten Plattform aufgestellt werden. Eine Befestigung am Fundament ist nicht erforderlich."
        ]
      },
      chimney: {
        title: "Rauchgasabführung",
        intro: "Der Anschluss des Ofens an den Schornstein erfolgt durch Kaminrohre, die folgenden Bedingungen entsprechen müssen:",
        items: [
          "Sie müssen aus Materialien hergestellt sein, die der Hitze der Rauchgase standhalten.",
          "Die Verbindungen müssen gut abgedichtet sein und die Materialien müssen hitze- und korrosionsbeständig sein.",
          "Sie müssen leicht sichtbar, leicht demontierbar und montierbar sein und eine thermische Ausdehnung ermöglichen.",
          "Ein vertikales Rohrstück mit einer Länge von mindestens dem doppelten Durchmesser der Schornsteinöffnung muss am Ofenausgang installiert werden.",
          "Nach dem vertikalen Rohrstück kann ein horizontaler Abschnitt mit einer Neigung von mindestens 3% installiert werden.",
          "Richtungsänderungen sind an maximal 3 Stellen möglich, einschließlich des Schornsteineingangs.",
          "Die Bögen dürfen keinen Winkel von mehr als 90 Grad haben.",
          "Der Rohrdurchmesser muss über die gesamte Länge konstant bleiben."
        ]
      },
      heating: {
        title: "Erstbeheizung",
        intro: "Die Erstbeheizung muss sehr sorgfältig durchgeführt werden, wobei die Temperatur schrittweise erhöht wird. Sie dauert in der Regel 2-3 Tage.",
        warning: "Ein schneller Temperaturanstieg kann zur Rissbildung am Fundament und an der Kuppel führen.",
        waterWarning: "Während der Erstbeheizung können Wassertropfen aus dem Ofen austreten. Es wird empfohlen, keine elektrischen Geräte und Kabel in diesem Bereich zu platzieren.",
        tabs: {
          wood: "Holzöfen",
          gas: "Gasöfen",
          mix: "Holz/Gas (MIX) Öfen"
        }
      },
      gasWarning: "Die Tür nicht installieren, wenn der Gasbrenner in Betrieb ist. Der Ofen darf nur geschlossen werden, wenn der Gasbrenner ausgeschaltet ist."
    }
  };

  const c = content[lang as keyof typeof content] || content.it;

  const woodDays = lang === 'it' ? [
    { title: "Primo giorno", steps: ["Posizionare la legna nella parte sinistra della camera di cottura e accenderla. NON posizionarla a destra per non danneggiare il termometro.", "Raggiungere una temperatura di circa 100-150°C.", "Lasciare il forno in queste condizioni per 8-10 ore."] },
    { title: "Secondo giorno", steps: ["Accendere la legna.", "Raggiungere una temperatura di circa 200-250°C.", "Lasciare il forno in queste condizioni per 8-10 ore."] },
    { title: "Terzo giorno", steps: ["Accendere la legna.", "Raggiungere una temperatura di circa 300-320°C.", "A questa temperatura, il forno è pronto per cuocere la pizza."] }
  ] : [
    { title: lang === 'en' ? "First day" : lang === 'fr' ? "Premier jour" : lang === 'es' ? "Primer día" : "Erster Tag", steps: [lang === 'en' ? "Put the woods to the left part of the baking chamber and light them. Do NOT put them to the right side because you may damage the thermometer." : lang === 'fr' ? "Placer le bois dans la partie gauche de la chambre de cuisson et l'allumer. NE PAS le placer à droite pour ne pas endommager le thermomètre." : lang === 'es' ? "Colocar la leña en la parte izquierda de la cámara de cocción y encenderla. NO colocarla a la derecha para no dañar el termómetro." : "Legen Sie das Holz in den linken Teil der Backkammer und zünden Sie es an. Legen Sie es NICHT auf die rechte Seite, um das Thermometer nicht zu beschädigen.", lang === 'en' ? "Reach a temperature of about 100-150°C." : lang === 'fr' ? "Atteindre une température d'environ 100-150°C." : lang === 'es' ? "Alcanzar una temperatura de aproximadamente 100-150°C." : "Eine Temperatur von ca. 100-150°C erreichen.", lang === 'en' ? "Leave the oven in these conditions for 8-10 hours." : lang === 'fr' ? "Laisser le four dans ces conditions pendant 8-10 heures." : lang === 'es' ? "Dejar el horno en estas condiciones durante 8-10 horas." : "Den Ofen 8-10 Stunden in diesen Bedingungen belassen."] },
    { title: lang === 'en' ? "Second day" : lang === 'fr' ? "Deuxième jour" : lang === 'es' ? "Segundo día" : "Zweiter Tag", steps: [lang === 'en' ? "Light the woods." : lang === 'fr' ? "Allumer le bois." : lang === 'es' ? "Encender la leña." : "Holz anzünden.", lang === 'en' ? "Reach a temperature of about 200-250°C." : lang === 'fr' ? "Atteindre une température d'environ 200-250°C." : lang === 'es' ? "Alcanzar una temperatura de aproximadamente 200-250°C." : "Eine Temperatur von ca. 200-250°C erreichen.", lang === 'en' ? "Leave the oven in these conditions for 8-10 hours." : lang === 'fr' ? "Laisser le four dans ces conditions pendant 8-10 heures." : lang === 'es' ? "Dejar el horno en estas condiciones durante 8-10 horas." : "Den Ofen 8-10 Stunden in diesen Bedingungen belassen."] },
    { title: lang === 'en' ? "Third day" : lang === 'fr' ? "Troisième jour" : lang === 'es' ? "Tercer día" : "Dritter Tag", steps: [lang === 'en' ? "Light the woods." : lang === 'fr' ? "Allumer le bois." : lang === 'es' ? "Encender la leña." : "Holz anzünden.", lang === 'en' ? "Reach a temperature of about 300-320°C." : lang === 'fr' ? "Atteindre une température d'environ 300-320°C." : lang === 'es' ? "Alcanzar una temperatura de aproximadamente 300-320°C." : "Eine Temperatur von ca. 300-320°C erreichen.", lang === 'en' ? "At this temperature, the oven is ready to bake pizza." : lang === 'fr' ? "À cette température, le four est prêt à cuire la pizza." : lang === 'es' ? "A esta temperatura, el horno está listo para cocinar pizza." : "Bei dieser Temperatur ist der Ofen bereit zum Pizzabacken."] }
  ];

  const gasDays = lang === 'it' ? [
    { title: "Primo giorno", steps: ["Accendere il forno.", "Diminuire il regolatore di potenza al minimo.", "Impostare la temperatura di lavoro a 100°C.", "Lasciare il forno in queste condizioni per 8-10 ore."] },
    { title: "Secondo giorno", steps: ["Accendere il forno.", "Impostare il regolatore di potenza al 30%.", "Impostare la temperatura di lavoro a 200°C.", "Lasciare in queste condizioni per 4-5 ore.", "Impostare il regolatore di potenza al 50%.", "Impostare la temperatura di lavoro a 250°C.", "Lasciare in queste condizioni per 4-5 ore."] },
    { title: "Terzo giorno", steps: ["Accendere il forno.", "Impostare il regolatore di potenza all'80%.", "Impostare la temperatura a 300°C.", "Lasciare in queste condizioni per 4-5 ore.", "Impostare il regolatore di potenza al 100%.", "Impostare la temperatura a 330-350°C.", "A questa temperatura, il forno è pronto per cuocere la pizza."] }
  ] : [
    { title: lang === 'en' ? "First day" : lang === 'fr' ? "Premier jour" : lang === 'es' ? "Primer día" : "Erster Tag", steps: ["Switch on the oven.", "Decrease the power regulator to the minimum.", "Set the working temperature to 100°C.", "Leave the oven in these conditions for 8-10 hours."] },
    { title: lang === 'en' ? "Second day" : lang === 'fr' ? "Deuxième jour" : lang === 'es' ? "Segundo día" : "Zweiter Tag", steps: ["Switch on the oven.", "Set the power regulator to 30%.", "Set the working temperature to 200°C.", "Leave for 4-5 hours.", "Set the power regulator to 50%.", "Set the working temperature to 250°C.", "Leave for 4-5 hours."] },
    { title: lang === 'en' ? "Third day" : lang === 'fr' ? "Troisième jour" : lang === 'es' ? "Tercer día" : "Dritter Tag", steps: ["Switch on the oven.", "Set the power regulator to 80%.", "Set the working temperature to 300°C.", "Leave for 4-5 hours.", "Set the power regulator to 100%.", "Set the working temperature to 330-350°C.", "The oven is ready to bake pizza."] }
  ];

  const mixNote = lang === 'it' 
    ? "Si consiglia di effettuare il riscaldamento iniziale utilizzando entrambi i tipi di combustibile – legna e gas. La combustione della legna può essere effettuata in modo basilare – uno o due pezzi di legna con bassa intensità."
    : lang === 'fr' ? "Il est recommandé d'effectuer le chauffage initial en utilisant les deux types de combustible – bois et gaz."
    : lang === 'es' ? "Se recomienda realizar el calentamiento inicial utilizando ambos tipos de combustible – leña y gas."
    : lang === 'de' ? "Es wird empfohlen, die Erstbeheizung mit beiden Brennstoffarten durchzuführen – Holz und Gas."
    : "It is recommended to perform initial heating using both types of fuel – wood and gas. Wood burning can be done on a basic way – one or two pieces of wood with low burning intensity.";

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <RouteSEO
        lang={lang}
        title={`${c.title} | Vesuviano Forni`}
        description={c.subtitle}
      />
      
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">{c.title}</h1>
            <p className="text-lg text-stone-600">{c.subtitle}</p>
          </div>

          {/* Lifting */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 border-b-2 border-vesuviano-500 pb-2">{c.lifting.title}</h2>
            <ul className="space-y-3">
              {c.lifting.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-vesuviano-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-stone-700">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <img src="/lovable-uploads/sollevamento-forno-diagramma.webp" alt="Diagramma sollevamento forno Vesuviano" className="rounded-lg shadow-md w-full max-w-3xl mx-auto" loading="lazy" />
            </div>
          </section>

          {/* Chimney */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 border-b-2 border-vesuviano-500 pb-2">{c.chimney.title}</h2>
            <p className="text-stone-700 mb-4">{c.chimney.intro}</p>
            <ul className="space-y-3">
              {c.chimney.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-vesuviano-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-stone-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Initial Heating */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4 border-b-2 border-vesuviano-500 pb-2">{c.heating.title}</h2>
            <p className="text-stone-700 mb-4">{c.heating.intro}</p>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-lg">
              <p className="font-bold text-red-700">⚠️ {c.heating.warning}</p>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
              <p className="text-amber-800">{c.heating.waterWarning}</p>
            </div>

            <Tabs defaultValue="wood" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="wood">{c.heating.tabs.wood}</TabsTrigger>
                <TabsTrigger value="gas">{c.heating.tabs.gas}</TabsTrigger>
              </TabsList>

              <TabsContent value="wood" className="mt-6 space-y-6">
                {woodDays.map((day, i) => (
                  <div key={i} className="bg-white rounded-lg p-5 shadow-sm border border-stone-200">
                    <h3 className="font-bold text-stone-800 mb-3">{day.title}</h3>
                    <ul className="space-y-2">
                      {day.steps.map((step, j) => (
                        <li key={j} className="flex items-start gap-2 text-stone-700">
                          <span className="text-vesuviano-500 font-bold">•</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="gas" className="mt-6 space-y-6">
                {gasDays.map((day, i) => (
                  <div key={i} className="bg-white rounded-lg p-5 shadow-sm border border-stone-200">
                    <h3 className="font-bold text-stone-800 mb-3">{day.title}</h3>
                    <ul className="space-y-2">
                      {day.steps.map((step, j) => (
                        <li key={j} className="flex items-start gap-2 text-stone-700">
                          <span className="text-vesuviano-500 font-bold">•</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <p className="font-bold text-red-700">⚠️ {c.gasWarning}</p>
                </div>
              </TabsContent>

            </Tabs>
          </section>
        </div>
      </main>

      <AIChatWidget />
    </div>
  );
};

export default LocalizedUsefulInfo;
