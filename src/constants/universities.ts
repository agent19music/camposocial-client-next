export const UNIVERSITIES = [
    "University of Nairobi",
    "Kenyatta University",
    "Moi University",
    "Egerton University",
    "Jomo Kenyatta University of Agriculture and Technology",
    "Maseno University",
    "Strathmore University",
    "United States International University Africa",
    "Mount Kenya University",
    "Daystar University",
    "Catholic University of Eastern Africa",
    "Technical University of Kenya",
    "Technical University of Mombasa",
    "Multimedia University of Kenya",
    "Kabarak University",
    "Riara University",
    "KCA University",
    "Africa Nazarene University",
    "Zetech University",
    "Dedan Kimathi University of Technology"
];

export const UNIVERSITY_SLUGS: Record<string, string> = {
    "University of Nairobi": "uon",
    "Kenyatta University": "ku",
    "Moi University": "moi",
    "Egerton University": "egerton",
    "Jomo Kenyatta University of Agriculture and Technology": "jkuat",
    "Maseno University": "maseno",
    "Strathmore University": "strathmore",
    "United States International University Africa": "usiu",
    "Mount Kenya University": "mku",
    "Daystar University": "daystar",
    "Catholic University of Eastern Africa": "cuea",
    "Technical University of Kenya": "tuk",
    "Technical University of Mombasa": "tum",
    "Multimedia University of Kenya": "mmu",
    "Kabarak University": "kabarak",
    "Riara University": "riara",
    "KCA University": "kca",
    "Africa Nazarene University": "anu",
    "Zetech University": "zetech",
    "Dedan Kimathi University of Technology": "dkut"
};

export const getUniversityBadgeUrl = (uniName: string): string => {
    const slug = UNIVERSITY_SLUGS[uniName];
    if (!slug) return "";
    return `https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/uni-logos-badges/${slug}-badge.png`;
};

export const FACULTIES = [
    "Faculty of Arts",
    "Faculty of Science",
    "Faculty of Engineering",
    "Faculty of Medicine",
    "Faculty of Law",
    "Faculty of Business & Economics",
    "Faculty of Education",
    "Faculty of Agriculture",
    "Faculty of Computing/IT",
    "Faculty of Built Environment",
    "Faculty of Social Sciences",
    "School of Nursing",
    "School of Pharmacy",
    "School of Architecture",
    "School of Journalism",
    "Other"
];
