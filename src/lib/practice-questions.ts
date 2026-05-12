export type PracticeQ = {
  q: string;
  a: string;
  choices: string[];
  system: string;
  topic: string;
  tags?: PracticeTag[];
};

export const PRACTICE_TAGS = ["boards", "nclex", "clinical", "anatomy", "physiology"] as const;
export type PracticeTag = (typeof PRACTICE_TAGS)[number];

export function defaultTagsFor(q: PracticeQ): PracticeTag[] {
  if (q.tags && q.tags.length > 0) return q.tags;
  const tags: PracticeTag[] = ["boards"];
  if (["nervous", "endocrine", "cardiovascular"].includes(q.system)) tags.push("nclex");
  if (q.q.match(/treat|therapy|drug|patient|presents|diagnosis|management/i)) tags.push("clinical");
  const anatomicalSystems = ["skeletal", "muscular", "lymphatic"];
  if (anatomicalSystems.includes(q.system)) tags.push("anatomy");
  const physTopics = ["sliding filament", "cardiac", "respiratory", "renal", "endocrine"];
  if (physTopics.some((t) => q.topic.toLowerCase().includes(t.toLowerCase()))) tags.push("physiology");
  return tags;
}

export const practiceQuestions: PracticeQ[] = [
  // CARDIOVASCULAR
  { system: "cardiovascular", topic: "Heart", q: "Which valve separates the right atrium from the right ventricle?", a: "Tricuspid", choices: ["Mitral", "Tricuspid", "Aortic", "Pulmonary"] },
  { system: "cardiovascular", topic: "Heart", q: "The SA node is normally supplied by which artery?", a: "Right coronary artery (in 60% of people)", choices: ["LAD", "Right coronary artery (in 60% of people)", "Circumflex", "Left main"] },
  { system: "cardiovascular", topic: "Heart", q: "Which fetal shunt becomes the ligamentum arteriosum?", a: "Ductus arteriosus", choices: ["Ductus venosus", "Foramen ovale", "Ductus arteriosus", "Umbilical vein"] },
  { system: "cardiovascular", topic: "Heart", q: "First heart sound (S1) corresponds to closure of…", a: "Mitral + tricuspid valves", choices: ["Aortic + pulmonary valves", "Mitral + tricuspid valves", "Pulmonary valve only", "Mitral valve only"] },
  { system: "cardiovascular", topic: "Heart", q: "PR interval represents…", a: "Atrial depolarization through AV node delay", choices: ["Ventricular depolarization", "Atrial depolarization through AV node delay", "Ventricular repolarization", "Sinus discharge"] },

  // RESPIRATORY
  { system: "respiratory", topic: "Lungs", q: "Which lung has 3 lobes?", a: "Right", choices: ["Left", "Right", "Both", "Neither"] },
  { system: "respiratory", topic: "Upper airway", q: "Which laryngeal cartilage is the only complete ring?", a: "Cricoid", choices: ["Thyroid", "Cricoid", "Arytenoid", "Epiglottis"] },
  { system: "respiratory", topic: "Upper airway", q: "Recurrent laryngeal nerve injury causes…", a: "Hoarseness", choices: ["Loss of smell", "Hoarseness", "Anosmia", "Dysphagia only"] },
  { system: "respiratory", topic: "Lungs", q: "Aspirated foreign bodies most commonly lodge in the…", a: "Right main bronchus", choices: ["Left main bronchus", "Right main bronchus", "Trachea", "Larynx"] },

  // DIGESTIVE
  { system: "digestive", topic: "Mesenteries", q: "The lesser omentum connects…", a: "Liver to lesser curvature of stomach", choices: ["Stomach to spleen", "Liver to lesser curvature of stomach", "Stomach to transverse colon", "Liver to diaphragm"] },
  { system: "digestive", topic: "Portal", q: "The portal vein is formed by union of…", a: "Superior mesenteric + splenic veins", choices: ["IVC + hepatic vein", "Superior mesenteric + splenic veins", "Inferior mesenteric + renal", "Gastric + cystic veins"] },
  { system: "digestive", topic: "Stomach", q: "Parietal cells secrete…", a: "HCl + intrinsic factor", choices: ["Pepsinogen", "HCl + intrinsic factor", "Gastrin", "Mucus"] },
  { system: "digestive", topic: "Pancreas", q: "Which cells of the islets make insulin?", a: "Beta cells", choices: ["Alpha cells", "Beta cells", "Delta cells", "PP cells"] },

  // NERVOUS
  { system: "nervous", topic: "Cranial nerves", q: "CN III palsy presents with which classic eye position?", a: "Down and out", choices: ["Up and in", "Down and out", "Adducted", "Elevated"] },
  { system: "nervous", topic: "Cranial nerves", q: "Bell's palsy affects which cranial nerve?", a: "VII", choices: ["V", "VII", "IX", "XII"] },
  { system: "nervous", topic: "Eye", q: "Aqueous humor is produced by the…", a: "Ciliary body", choices: ["Iris", "Ciliary body", "Choroid", "Retina"] },
  { system: "nervous", topic: "Ear", q: "Endolymph is found in the…", a: "Membranous labyrinth (scala media)", choices: ["Bony labyrinth", "Membranous labyrinth (scala media)", "Middle ear", "Eustachian tube"] },
  { system: "nervous", topic: "Autonomic", q: "Preganglionic parasympathetic neurotransmitter is…", a: "ACh (nicotinic)", choices: ["NE", "ACh (nicotinic)", "Dopamine", "Glutamate"] },
  { system: "nervous", topic: "Autonomic", q: "Horner syndrome triad =", a: "Ptosis + miosis + anhidrosis", choices: ["Ptosis + mydriasis + sweating", "Ptosis + miosis + anhidrosis", "Exophthalmos + sweating", "Mydriasis + anhidrosis + diplopia"] },
  { system: "nervous", topic: "Brain", q: "Broca's area is in the…", a: "Inferior frontal gyrus (dominant hemisphere)", choices: ["Superior temporal gyrus", "Inferior frontal gyrus (dominant hemisphere)", "Postcentral gyrus", "Cerebellum"] },

  // MUSCULAR
  { system: "muscular", topic: "Sliding filament", q: "Calcium binds to which protein to expose actin?", a: "Troponin C", choices: ["Tropomyosin", "Troponin C", "Myosin", "Titin"] },
  { system: "muscular", topic: "Sliding filament", q: "Rigor mortis occurs because…", a: "No ATP to detach myosin from actin", choices: ["Calcium leaks out", "No ATP to detach myosin from actin", "Sarcomeres shorten permanently", "Acetylcholine accumulates"] },

  // SKELETAL
  { system: "skeletal", topic: "Vertebral column", q: "The dens (odontoid) is part of which vertebra?", a: "C2 (axis)", choices: ["C1 (atlas)", "C2 (axis)", "C7", "T1"] },
  { system: "skeletal", topic: "Bone histology", q: "Osteoclasts derive from…", a: "Monocyte-macrophage lineage", choices: ["Mesenchymal stem cells", "Monocyte-macrophage lineage", "Chondrocytes", "Endothelial cells"] },

  // URINARY
  { system: "urinary", topic: "Kidney", q: "The macula densa senses…", a: "Distal tubular NaCl", choices: ["Distal tubular NaCl", "Renal blood pressure", "Glomerular protein", "Urine osmolarity"] },
  { system: "urinary", topic: "Kidney", q: "Loop diuretics act on the…", a: "Thick ascending limb (NKCC2)", choices: ["Proximal tubule", "Thick ascending limb (NKCC2)", "Distal tubule", "Collecting duct"] },

  // ENDOCRINE
  { system: "endocrine", topic: "Pituitary", q: "Posterior pituitary releases which hormones?", a: "Oxytocin + ADH (vasopressin)", choices: ["GH + prolactin", "Oxytocin + ADH (vasopressin)", "TSH + ACTH", "FSH + LH"] },
  { system: "endocrine", topic: "Adrenal", q: "Aldosterone is produced in the…", a: "Zona glomerulosa", choices: ["Zona glomerulosa", "Zona fasciculata", "Zona reticularis", "Adrenal medulla"] },

  // REPRODUCTIVE
  { system: "reproductive", topic: "Male", q: "Sperm pathway mnemonic 'SEVEN UP' starts with…", a: "Seminiferous tubules", choices: ["Spermatic cord", "Seminiferous tubules", "Scrotum", "Seminal vesicle"] },
  { system: "reproductive", topic: "Male", q: "BPH primarily affects which prostate zone?", a: "Transition zone (periurethral)", choices: ["Peripheral zone", "Transition zone (periurethral)", "Central zone", "Anterior fibromuscular stroma"] },
  { system: "reproductive", topic: "Pelvis", q: "The pelvic diaphragm is composed of…", a: "Levator ani + coccygeus", choices: ["Internal + external obturator", "Levator ani + coccygeus", "Piriformis + iliacus", "Psoas + iliacus"] },

  // LYMPHATIC
  { system: "lymphatic", topic: "Lymph nodes", q: "The thoracic duct empties into the…", a: "Junction of left internal jugular + left subclavian veins", choices: ["Right brachiocephalic vein", "Junction of left internal jugular + left subclavian veins", "SVC directly", "Azygos vein"] },
  { system: "lymphatic", topic: "Spleen", q: "Howell-Jolly bodies on a peripheral smear suggest…", a: "Asplenia or splenic dysfunction", choices: ["Iron deficiency", "Asplenia or splenic dysfunction", "Hemolysis", "Lead poisoning"] },

  // INTEGUMENTARY
  { system: "integumentary", topic: "Skin", q: "Stratum corneum is composed of…", a: "Dead, keratin-filled cells", choices: ["Melanocytes", "Dead, keratin-filled cells", "Basal stem cells", "Langerhans cells"] },
  { system: "integumentary", topic: "Skin", q: "Vitamin D synthesis begins in the skin from…", a: "7-dehydrocholesterol + UV-B", choices: ["Cholesterol + UV-A", "7-dehydrocholesterol + UV-B", "Ergosterol", "Vitamin D2 directly"] },

  // FOUNDATIONS
  { system: "foundations", topic: "Histology", q: "Pseudostratified ciliated columnar epithelium lines the…", a: "Trachea + upper airways", choices: ["Esophagus", "Trachea + upper airways", "Bladder", "Small intestine"] },
  { system: "foundations", topic: "Histology", q: "Hyaline cartilage is found in…", a: "Articular surfaces + tracheal rings + costal cartilages", choices: ["Pubic symphysis", "Articular surfaces + tracheal rings + costal cartilages", "Pinna of ear", "Intervertebral disc annulus"] },
  { system: "foundations", topic: "Body organization", q: "Retroperitoneal organs mnemonic SAD PUCKER includes…", a: "Pancreas (most), Kidneys, Adrenals, Ureters", choices: ["Stomach, liver, gallbladder", "Pancreas (most), Kidneys, Adrenals, Ureters", "Spleen, transverse colon", "Sigmoid colon, rectum"] },
];
