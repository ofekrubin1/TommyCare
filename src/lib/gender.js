// Hebrew wording that depends on the child: 'girl' → "ישנה", 'boy' → "ישן", not set yet → both ("ישן/ה").
export const byGender = (gender, girl, boy, both = `${boy}/ה`) => (gender === 'girl' ? girl : gender === 'boy' ? boy : both);

export const GENDERS = [{ value: 'girl', label: 'בת' }, { value: 'boy', label: 'בן' }];
