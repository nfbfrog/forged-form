export const menus = [
  {
    id: 'a',
    label: 'Menu A',
    summary: 'Bright, simple, high-protein',
    meals: [
      { name: 'Yogurt bowl', amount: '250g Greek yogurt, 120g berries, 40g oats, 10g chia', protein: 38 },
      { name: 'Chicken rice bowl', amount: '160g cooked chicken, 150g rice, 200g vegetables', protein: 52 },
      { name: 'Shake + fruit', amount: '30g whey, 100g banana, water or milk', protein: 24 },
      { name: 'Salmon plate', amount: '150g salmon, 250g potato, 150g greens', protein: 38 },
    ],
  },
  {
    id: 'b',
    label: 'Menu B',
    summary: 'Comforting, savory, meal-prep ready',
    meals: [
      { name: 'Egg breakfast', amount: '2 eggs, 200g egg whites, 60g toast, 150g fruit', protein: 38 },
      { name: 'Turkey quinoa bowl', amount: '160g turkey, 150g quinoa, 200g vegetables', protein: 50 },
      { name: 'Cottage cheese bowl', amount: '250g cottage cheese, 100g fruit', protein: 32 },
      { name: 'Beef rice plate', amount: '140g lean beef, 150g rice, 200g salad', protein: 38 },
    ],
  },
]

export const sessions = [
  {
    id: 'upper-a',
    name: 'Upper A',
    focus: 'Press + pull',
    exercises: [
      ['incline-press', 'Incline dumbbell press', '3 x 8-12', 'Machine chest press'],
      ['cable-row', 'Seated cable row', '3 x 8-12', 'Chest-supported row'],
      ['lat-pulldown', 'Neutral-grip pulldown', '3 x 10-12', 'Assisted pull-up'],
      ['lateral-raise', 'Cable lateral raise', '2 x 12-15', 'Light dumbbells'],
    ],
  },
  {
    id: 'lower-a',
    name: 'Lower A',
    focus: 'Glutes + quads',
    exercises: [
      ['goblet-squat', 'Goblet squat', '3 x 8-12', 'Leg press'],
      ['rdl', 'Romanian deadlift', '3 x 8-10', 'Cable pull-through'],
      ['split-squat', 'Supported split squat', '2 x 8/side', 'Step-up'],
      ['calf-raise', 'Standing calf raise', '2 x 12-15', 'Seated calf raise'],
    ],
  },
  {
    id: 'upper-b',
    name: 'Upper B',
    focus: 'Back + shoulders',
    exercises: [
      ['shoulder-press', 'Machine shoulder press', '3 x 8-12', 'Landmine press'],
      ['one-arm-row', 'One-arm cable row', '3 x 10/side', 'Dumbbell row'],
      ['push-up', 'Incline push-up', '3 x near technical limit', 'Cable press'],
      ['face-pull', 'Face pull', '2 x 12-15', 'Reverse fly'],
    ],
  },
  {
    id: 'lower-b',
    name: 'Lower B',
    focus: 'Hamstrings + glutes',
    exercises: [
      ['hip-thrust', 'Hip thrust', '3 x 8-12', 'Glute bridge'],
      ['leg-curl', 'Seated leg curl', '3 x 10-12', 'Ball curl'],
      ['reverse-lunge', 'Reverse lunge', '2 x 8/side', 'Low step-up'],
      ['carry', 'Suitcase carry', '3 x 30 sec/side', 'Pallof press'],
    ],
  },
] as const

export const researchItems = [
  {
    id: 'cycle-training',
    name: 'Cycle-aware training',
    goals: ['cycle', 'training', 'recovery'],
    evidence: 'Practical tracking framework',
    overview: 'Energy, soreness, heat tolerance, hunger, sleep, and joint feel can shift across the cycle. The app treats that context as useful data, not an excuse or a diagnosis.',
    watch: 'Severe pain, fainting, heavy bleeding, chest symptoms, or unusual weakness should be discussed with a clinician.',
  },
  {
    id: 'protein-recomp',
    name: 'Protein + body recomposition',
    goals: ['nutrition', 'training'],
    evidence: 'Core nutrition principle',
    overview: 'Protein helps protect lean mass while training and dieting. The app keeps protein visible because missed intake is one of the easiest ways a cut starts feeling worse than it needs to.',
    watch: 'Kidney disease, eating-disorder history, pregnancy, or complex medical conditions should change targets with professional guidance.',
  },
  {
    id: 'appetite-support',
    name: 'Low appetite support',
    goals: ['nutrition', 'metabolic'],
    evidence: 'Medication-aware habit support',
    overview: 'When appetite is low, the first job is keeping protein, hydration, fiber, and training fuel from disappearing. The app favors smaller meals and simple fallback choices.',
    watch: 'Persistent vomiting, dehydration, severe abdominal pain, pregnancy plans, or medication side effects belong with the prescribing clinician.',
  },
  {
    id: 'peri-menopause',
    name: 'Perimenopause signals',
    goals: ['cycle', 'menopause', 'recovery'],
    evidence: 'Symptom trend tracking',
    overview: 'Sleep, hot flashes, mood, cycle irregularity, recovery, and body-composition response can change during perimenopause. Tracking patterns helps make appointments and plan adjustments more specific.',
    watch: 'New heavy bleeding, postmenopausal bleeding, severe mood changes, or disruptive sleep symptoms need medical review.',
  },
  {
    id: 'bloodwork-basics',
    name: 'Bloodwork basics',
    goals: ['labs', 'metabolic'],
    evidence: 'Clinical conversation support',
    overview: 'CBC, ferritin, lipids, A1c, thyroid markers, liver/kidney markers, and hormones should be interpreted with symptoms, life stage, medication, and cycle timing.',
    watch: 'This app does not diagnose labs. Use it to organize questions and trends for a qualified clinician.',
  },
]

export const labReferences = [
  ['Blood pressure', 'Use home trends, not one reading. Under 120/80 mm Hg is considered normal by the AHA.'],
  ['HbA1c', 'Below 5.7% is generally normal; 5.7-6.4% is prediabetes; 6.5%+ may indicate diabetes and needs confirmation.'],
  ['Lipids', 'Review LDL, HDL, triglycerides, and non-HDL together. General non-HDL goal is below 130 mg/dL.'],
  ['CBC + ferritin', 'Menstruation can raise iron-loss risk. Review fatigue, hemoglobin, ferritin, and hematocrit together.'],
  ['Liver + kidney', 'ALT/AST and creatinine/eGFR should be interpreted against your history, medications, hydration, and muscle mass.'],
  ['Hormones', 'Estradiol and other hormone values shift by life stage, cycle timing, symptoms, and prescribed therapy. Trend with your clinician.'],
]
