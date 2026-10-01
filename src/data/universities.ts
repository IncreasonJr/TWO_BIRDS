export const GHANAIAN_UNIVERSITIES = [
  'University of Ghana (UG)',
  'Kwame Nkrumah University of Science and Technology (KNUST)',
  'University of Cape Coast (UCC)',
  'University of Education, Winneba (UEW)',
  'University for Development Studies (UDS)',
  'Ghana Institute of Management and Public Administration (GIMPA)',
  'Ashesi University',
  'Central University',
  'University of Professional Studies, Accra (UPSA)',
  'Ghana Communication Technology University (GCTU)',
  'Accra Technical University',
  'Kumasi Technical University',
  'Takoradi Technical University',
  'Ho Technical University',
  'University of Health and Allied Sciences (UHAS)',
  'Nurses Training College, Ho',
  'Holy Spirit College',
  'School of Hygiene, Ho',
  'Other',
] as const;

export type GhanaianUniversity = (typeof GHANAIAN_UNIVERSITIES)[number];
