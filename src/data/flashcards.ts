import type { FlashDeck, Flashcard } from '@/types'
import { slugify } from './specialties'

export const DECKS: FlashDeck[] = [
  { id: 'signos', name: 'Signos clínicos', description: 'Signos y epónimos que aparecen una y otra vez en el examen.', color: '#14b8a6', icon: 'stethoscope' },
  { id: 'farmacos', name: 'Tratamientos de elección', description: 'El fármaco o la conducta de primera línea para cada cuadro.', specialty: 'farmacologia', color: '#2563eb', icon: 'pill' },
  { id: 'antidotos', name: 'Antídotos y toxicología', description: 'Intoxicaciones frecuentes y su antídoto.', specialty: 'emergencias', color: '#ea580c', icon: 'siren' },
  { id: 'laboratorio', name: 'Valores de laboratorio', description: 'Valores de referencia y puntos de corte clave.', color: '#8b5cf6', icon: 'flask-conical' },
  { id: 'pediatria', name: 'Pediatría esencial', description: 'Desarrollo, neonatología y patologías frecuentes.', specialty: 'pediatria', color: '#22c55e', icon: 'baby' },
  { id: 'obstetricia', name: 'Obstetricia esencial', description: 'Control prenatal, emergencias obstétricas y conceptos clave.', specialty: 'ginecologia-obstetricia', color: '#f43f5e', icon: 'venus' },
  { id: 'bioestadistica', name: 'Bioestadística y epidemiología', description: 'Fórmulas y definiciones que no puedes fallar.', specialty: 'salud-publica', color: '#0d9488', icon: 'users' },
]

type C = [deck: string, front: string, back: string]

const RAW: C[] = [
  // Signos clínicos
  ['signos', 'Signo de Murphy', 'Detención de la inspiración al palpar el hipocondrio derecho → colecistitis aguda.'],
  ['signos', 'Signo de Rovsing', 'Dolor en fosa ilíaca derecha al comprimir la fosa ilíaca izquierda → apendicitis.'],
  ['signos', 'Signo de Blumberg', 'Dolor a la descompresión brusca → irritación peritoneal.'],
  ['signos', 'Signo de Cullen / Grey-Turner', 'Equimosis periumbilical / en flancos → hemorragia retroperitoneal (pancreatitis necrohemorrágica, ectópico roto).'],
  ['signos', 'Tríada de Charcot', 'Fiebre + ictericia + dolor en HCD → colangitis aguda. + hipotensión y confusión = péntada de Reynolds.'],
  ['signos', 'Tríada de Beck', 'Hipotensión + ingurgitación yugular + ruidos cardíacos apagados → taponamiento cardíaco.'],
  ['signos', 'Tríada de Cushing', 'Hipertensión + bradicardia + respiración irregular → hipertensión intracraneal.'],
  ['signos', 'Signo de Kernig y Brudzinski', 'Signos de irritación meníngea (meningitis, hemorragia subaracnoidea).'],
  ['signos', 'Signo de Chvostek y Trousseau', 'Contracción facial al percutir el nervio facial / espasmo carpal con el manguito → hipocalcemia.'],
  ['signos', 'Pulso paradójico', 'Caída de la PAS > 10 mmHg en inspiración → taponamiento cardíaco, asma grave.'],
  ['signos', 'Signo de Homans', 'Dolor en pantorrilla con la dorsiflexión del pie → TVP (poco sensible y poco específico).'],
  ['signos', 'Signo de Courvoisier-Terrier', 'Vesícula palpable no dolorosa + ictericia → obstrucción maligna (cáncer de cabeza de páncreas).'],
  ['signos', 'Manchas de Koplik', 'Puntos blanquecinos en mucosa yugal → sarampión (pródromo).'],
  ['signos', 'Signo de Nikolsky', 'Desprendimiento epidérmico con la presión lateral → pénfigo vulgar, necrólisis epidérmica tóxica, SSSS.'],

  // Tratamientos de elección
  ['farmacos', 'Sífilis primaria', 'Penicilina G benzatínica 2,4 MUI IM dosis única.'],
  ['farmacos', 'Neumonía por Pneumocystis', 'Trimetoprim-sulfametoxazol (+ corticoide si PaO₂ < 70 mmHg).'],
  ['farmacos', 'Fibrilación auricular: control de frecuencia', 'Betabloqueador o calcioantagonista no dihidropiridínico (evitar este último si FEVI reducida).'],
  ['farmacos', 'Crisis de ausencia típica', 'Etosuximida (o ácido valproico).'],
  ['farmacos', 'Estado epiléptico (primera línea)', 'Benzodiacepina: lorazepam IV, diazepam IV o midazolam IM.'],
  ['farmacos', 'Hipertensión en el embarazo (urgencia)', 'Labetalol IV, hidralazina IV o nifedipino oral.'],
  ['farmacos', 'Gota aguda', 'AINE, colchicina o corticoide. No iniciar ni suspender alopurinol durante la crisis.'],
  ['farmacos', 'Erradicación de H. pylori (esquema clásico)', 'IBP + amoxicilina + claritromicina por 14 días (si resistencia a claritromicina baja). Alternativa: cuádruple con bismuto.'],
  ['farmacos', 'Malaria por P. falciparum no complicada', 'Terapia combinada con artemisinina (p. ej. artemeter-lumefantrina).'],
  ['farmacos', 'Shock séptico: vasopresor de primera línea', 'Noradrenalina, con meta de PAM ≥ 65 mmHg.'],
  ['farmacos', 'Toxoplasmosis cerebral', 'Pirimetamina + sulfadiazina + ácido folínico.'],
  ['farmacos', 'Hipertiroidismo en el 1er trimestre de embarazo', 'Propiltiouracilo (metimazol en 2.º y 3.er trimestre).'],

  // Antídotos
  ['antidotos', 'Paracetamol', 'N-acetilcisteína.'],
  ['antidotos', 'Opioides', 'Naloxona.'],
  ['antidotos', 'Benzodiacepinas', 'Flumazenil (con precaución: puede desencadenar convulsiones).'],
  ['antidotos', 'Organofosforados', 'Atropina + pralidoxima.'],
  ['antidotos', 'Heparina no fraccionada', 'Sulfato de protamina.'],
  ['antidotos', 'Warfarina', 'Vitamina K (+ concentrado de complejo protrombínico o plasma si hay sangrado).'],
  ['antidotos', 'Metanol / etilenglicol', 'Fomepizol (o etanol) ± hemodiálisis.'],
  ['antidotos', 'Betabloqueadores', 'Glucagón.'],
  ['antidotos', 'Digoxina', 'Anticuerpos antidigoxina (fragmentos Fab).'],
  ['antidotos', 'Cianuro', 'Hidroxocobalamina.'],
  ['antidotos', 'Monóxido de carbono', 'Oxígeno al 100% (hiperbárico en casos graves).'],
  ['antidotos', 'Hierro', 'Deferoxamina.'],
  ['antidotos', 'Antidepresivos tricíclicos (QRS ancho)', 'Bicarbonato de sodio.'],
  ['antidotos', 'Sulfato de magnesio', 'Gluconato de calcio.'],

  // Laboratorio
  ['laboratorio', 'Sodio sérico normal', '135–145 mEq/L.'],
  ['laboratorio', 'Potasio sérico normal', '3,5–5,0 mEq/L.'],
  ['laboratorio', 'Anion gap', 'Na − (Cl + HCO₃) ≈ 8–12 mEq/L. Elevado: cetoacidosis, láctica, uremia, tóxicos (metanol, etilenglicol, salicilatos).'],
  ['laboratorio', 'Gasometría arterial normal', 'pH 7,35–7,45 · PaCO₂ 35–45 mmHg · HCO₃ 22–26 mEq/L.'],
  ['laboratorio', 'Fórmula de Winter', 'PaCO₂ esperada = 1,5 × HCO₃ + 8 ± 2 (compensación de acidosis metabólica).'],
  ['laboratorio', 'Calcio corregido', 'Ca corregido = Ca medido + 0,8 × (4 − albúmina).'],
  ['laboratorio', 'Diagnóstico de diabetes', 'Ayunas ≥ 126 mg/dL · PTOG 2 h ≥ 200 · HbA1c ≥ 6,5% · al azar ≥ 200 con síntomas.'],
  ['laboratorio', 'Prediabetes', 'Ayunas 100–125 mg/dL · PTOG 2 h 140–199 · HbA1c 5,7–6,4%.'],
  ['laboratorio', 'LDL: meta en muy alto riesgo cardiovascular', '< 55 mg/dL (ESC) y reducción ≥ 50% del basal.'],
  ['laboratorio', 'Plaquetas normales', '150 000–450 000 /µL.'],
  ['laboratorio', 'Osmolaridad sérica calculada', '2 × Na + glucosa/18 + BUN/2,8 ≈ 285–295 mOsm/kg.'],

  // Pediatría
  ['pediatria', 'Sonrisa social', '~2 meses.'],
  ['pediatria', 'Sostén cefálico', '~3–4 meses.'],
  ['pediatria', 'Sedestación sin apoyo', '~6–8 meses.'],
  ['pediatria', 'Marcha independiente', '~12–15 meses.'],
  ['pediatria', 'Test de Apgar: ¿cuándo se evalúa?', 'Al minuto 1 y 5 de vida. Evalúa FC, respiración, tono, reflejos y color (0–10).'],
  ['pediatria', 'Vacunas al nacer (RD)', 'BCG y hepatitis B.'],
  ['pediatria', 'Frecuencia respiratoria: taquipnea según OMS', '< 2 meses ≥ 60 rpm · 2–11 meses ≥ 50 rpm · 1–5 años ≥ 40 rpm.'],
  ['pediatria', 'Estenosis hipertrófica del píloro', 'Vómitos en proyectil no biliosos a las 3–6 semanas, "oliva" palpable, alcalosis metabólica hipoclorémica hipokalémica.'],
  ['pediatria', 'Invaginación intestinal', 'Dolor cólico intermitente, heces en "jalea de grosella", masa en morcilla. Diagnóstico por eco ("diana"); tratamiento: reducción hidrostática/neumática.'],
  ['pediatria', 'Plan C de deshidratación', '100 mL/kg IV (Ringer lactato): < 12 meses 30 mL/kg en 1 h + 70 mL/kg en 5 h; ≥ 12 meses en 30 min + 2,5 h.'],

  // Obstetricia
  ['obstetricia', 'Regla de Naegele', 'FPP = FUM + 7 días − 3 meses (+ 1 año).'],
  ['obstetricia', 'Definición de preeclampsia', 'TA ≥ 140/90 después de las 20 semanas + proteinuria o disfunción de órgano blanco.'],
  ['obstetricia', 'Síndrome HELLP', 'Hemólisis + enzimas hepáticas elevadas + plaquetas bajas (< 100 000).'],
  ['obstetricia', 'Toxicidad por sulfato de magnesio', 'Pérdida de reflejos osteotendinosos → depresión respiratoria → paro. Antídoto: gluconato de calcio.'],
  ['obstetricia', 'Maduración pulmonar fetal', 'Betametasona 12 mg IM c/24 h × 2 dosis (o dexametasona 6 mg c/12 h × 4) entre 24 y 34 semanas.'],
  ['obstetricia', 'Hemorragia posparto: las 4 T', 'Tono (atonía), Trauma, Tejido (restos), Trombina (coagulopatía).'],
  ['obstetricia', 'Hemorragia posparto: definición', 'Pérdida ≥ 1 000 mL o sangrado con signos de hipovolemia en las primeras 24 h (independiente de la vía).'],
  ['obstetricia', 'Test de Bishop', 'Evalúa madurez cervical: dilatación, borramiento, consistencia, posición y altura de la presentación. ≥ 8 = cérvix favorable.'],

  // Bioestadística
  ['bioestadistica', 'Sensibilidad', 'VP / (VP + FN). Ideal para pruebas de tamizaje (descartar: SnNout).'],
  ['bioestadistica', 'Especificidad', 'VN / (VN + FP). Ideal para confirmar (SpPin).'],
  ['bioestadistica', 'Valor predictivo positivo', 'VP / (VP + FP). Aumenta cuando aumenta la prevalencia.'],
  ['bioestadistica', 'NNT', '1 / reducción absoluta del riesgo.'],
  ['bioestadistica', 'Riesgo relativo', 'Incidencia en expuestos / incidencia en no expuestos. Estudios de cohorte y ensayos clínicos.'],
  ['bioestadistica', 'Error tipo I (α)', 'Rechazar la hipótesis nula siendo verdadera (falso positivo). Se relaciona con el valor p.'],
  ['bioestadistica', 'Error tipo II (β)', 'No rechazar la hipótesis nula siendo falsa (falso negativo). Potencia = 1 − β.'],
  ['bioestadistica', 'Tasa de mortalidad infantil', 'Defunciones en < 1 año / nacidos vivos × 1 000.'],
  ['bioestadistica', 'Razón de mortalidad materna', 'Muertes maternas / nacidos vivos × 100 000.'],
]

export const BUILTIN_CARDS: Flashcard[] = RAW.map(([deck, front, back]) => ({
  id: `fc-${deck}-${slugify(front)}`,
  deck,
  front,
  back,
  specialty: DECKS.find((d) => d.id === deck)?.specialty,
}))
