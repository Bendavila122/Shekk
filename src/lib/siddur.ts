/**
 * Shekk Siddur — Tier 1 native tool.
 *
 * Content policy:
 * - Hebrew is traditional liturgy in the public domain, reproduced unchanged.
 * - English renderings are plain, public-domain-style translations (JPS 1917 era
 *   phrasing for verses). No modern copyrighted translations are used.
 * - Nothing is invented, summarised or presented as a nusach it is not.
 * - Where a nusach has not been transcribed yet the reader says so plainly.
 */

export type NusachId = "ashkenaz" | "sephard" | "edot";

export const NUSACHIM: { id: NusachId; label: string; hint: string }[] = [
  { id: "ashkenaz", label: "Ashkenaz", hint: "Most yeshivas & sems, Anglo shuls" },
  { id: "sephard", label: "Sephard", hint: "Chassidic / Nusach Sfard" },
  { id: "edot", label: "Edot HaMizrach", hint: "Sephardi & Mizrachi communities" },
];

export type PrayerLine = {
  he: string;
  translit?: string;
  en?: string;
};

export type PrayerSection = {
  id: string;
  heading: string;
  hebrewHeading?: string;
  lines: PrayerLine[];
};

export type Prayer = {
  id: string;
  categoryId: string;
  title: string;
  hebrewTitle: string;
  blurb: string;
  when: string;
  /** Discreet attribution shown at the foot of the reader. */
  source: string;
  /** Sections we have not transcribed yet — listed honestly, never faked. */
  pending?: string[];
  text: Partial<Record<NusachId, PrayerSection[]>>;
};

export type SiddurCategory = {
  id: string;
  label: string;
  emoji: string;
  blurb: string;
};

export const SIDDUR_CATEGORIES: SiddurCategory[] = [
  { id: "shacharit", label: "Shacharit", emoji: "🌅", blurb: "Morning service" },
  { id: "mincha", label: "Mincha", emoji: "🌤️", blurb: "Afternoon service" },
  { id: "maariv", label: "Maariv", emoji: "🌙", blurb: "Evening service" },
  { id: "shema-sleep", label: "Shema before sleeping", emoji: "🛏️", blurb: "Krias Shema al hamita" },
  { id: "tefilat-haderech", label: "Tefilat HaDerech", emoji: "🧭", blurb: "The traveller's prayer" },
  { id: "birkat-hamazon", label: "Birkat Hamazon", emoji: "🍞", blurb: "Grace after meals" },
  { id: "brachot", label: "Common brachot", emoji: "🍇", blurb: "Everyday blessings" },
  { id: "havdalah", label: "Havdalah", emoji: "🕯️", blurb: "Ending Shabbat" },
];

/* ---------------------------------------------------------------- shared */

const MODEH_ANI: PrayerSection = {
  id: "modeh-ani",
  heading: "Modeh Ani",
  hebrewHeading: "מוֹדֶה אֲנִי",
  lines: [
    {
      he: "מוֹדֶה אֲנִי לְפָנֶיךָ מֶלֶךְ חַי וְקַיָּם, שֶׁהֶחֱזַרְתָּ בִּי נִשְׁמָתִי בְּחֶמְלָה, רַבָּה אֱמוּנָתֶךָ.",
      translit: "Modeh ani lefanecha melech chai v'kayam, shehechezarta bi nishmati b'chemla, rabba emunatecha.",
      en: "I give thanks before You, living and eternal King, that You have returned my soul within me with compassion — great is Your faithfulness.",
    },
  ],
};

const MAH_TOVU: PrayerSection = {
  id: "mah-tovu",
  heading: "Mah Tovu",
  hebrewHeading: "מַה טֹּבוּ",
  lines: [
    {
      he: "מַה טֹּבוּ אֹהָלֶיךָ יַעֲקֹב, מִשְׁכְּנֹתֶיךָ יִשְׂרָאֵל.",
      en: "How goodly are thy tents, O Jacob, thy dwellings, O Israel.",
    },
    {
      he: "וַאֲנִי בְּרֹב חַסְדְּךָ אָבוֹא בֵיתֶךָ, אֶשְׁתַּחֲוֶה אֶל הֵיכַל קָדְשְׁךָ בְּיִרְאָתֶךָ.",
      en: "As for me, in the abundance of Thy lovingkindness will I come into Thy house; I will bow down toward Thy holy temple in awe of Thee.",
    },
    {
      he: "יְיָ אָהַבְתִּי מְעוֹן בֵּיתֶךָ, וּמְקוֹם מִשְׁכַּן כְּבוֹדֶךָ.",
      en: "Lord, I love the habitation of Thy house, and the place where Thy glory dwelleth.",
    },
    {
      he: "וַאֲנִי אֶשְׁתַּחֲוֶה וְאֶכְרָעָה, אֶבְרְכָה לִפְנֵי יְיָ עֹשִׂי.",
      en: "As for me, I will bow down and bend the knee; I will bless before the Lord my Maker.",
    },
    {
      he: "וַאֲנִי תְפִלָּתִי לְךָ יְיָ עֵת רָצוֹן, אֱלֹהִים בְּרָב חַסְדֶּךָ, עֲנֵנִי בֶּאֱמֶת יִשְׁעֶךָ.",
      en: "As for me, may my prayer unto Thee, O Lord, be in an acceptable time; O God, in the abundance of Thy lovingkindness, answer me with the truth of Thy salvation.",
    },
  ],
};

const ASHREI: PrayerSection = {
  id: "ashrei",
  heading: "Ashrei (opening verses)",
  hebrewHeading: "אַשְׁרֵי",
  lines: [
    {
      he: "אַשְׁרֵי יוֹשְׁבֵי בֵיתֶךָ, עוֹד יְהַלְלוּךָ סֶּלָה.",
      en: "Happy are they that dwell in Thy house; they are ever praising Thee. Selah.",
    },
    {
      he: "אַשְׁרֵי הָעָם שֶׁכָּכָה לּוֹ, אַשְׁרֵי הָעָם שֶׁיְיָ אֱלֹהָיו.",
      en: "Happy is the people that is in such a case; happy is the people whose God is the Lord.",
    },
    {
      he: "תְּהִלָּה לְדָוִד. אֲרוֹמִמְךָ אֱלוֹהַי הַמֶּלֶךְ, וַאֲבָרְכָה שִׁמְךָ לְעוֹלָם וָעֶד.",
      en: "A Psalm of praise; of David. I will extol Thee, my God, O King; and I will bless Thy name for ever and ever.",
    },
    {
      he: "בְּכָל יוֹם אֲבָרְכֶךָּ, וַאֲהַלְלָה שִׁמְךָ לְעוֹלָם וָעֶד.",
      en: "Every day will I bless Thee; and I will praise Thy name for ever and ever.",
    },
    {
      he: "גָּדוֹל יְיָ וּמְהֻלָּל מְאֹד, וְלִגְדֻלָּתוֹ אֵין חֵקֶר.",
      en: "Great is the Lord, and highly to be praised; and His greatness is unsearchable.",
    },
  ],
};

const SHEMA: PrayerSection = {
  id: "shema",
  heading: "Shema — first paragraph",
  hebrewHeading: "שְׁמַע יִשְׂרָאֵל",
  lines: [
    {
      he: "שְׁמַע יִשְׂרָאֵל, יְיָ אֱלֹהֵינוּ, יְיָ אֶחָד.",
      translit: "Shema Yisrael, Adonai Eloheinu, Adonai echad.",
      en: "Hear, O Israel: the Lord our God, the Lord is one.",
    },
    {
      he: "בָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד.",
      en: "Blessed be the name of His glorious kingdom for ever and ever.",
    },
    {
      he: "וְאָהַבְתָּ אֵת יְיָ אֱלֹהֶיךָ, בְּכָל לְבָבְךָ וּבְכָל נַפְשְׁךָ וּבְכָל מְאֹדֶךָ.",
      en: "And thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy might.",
    },
    {
      he: "וְהָיוּ הַדְּבָרִים הָאֵלֶּה, אֲשֶׁר אָנֹכִי מְצַוְּךָ הַיּוֹם, עַל לְבָבֶךָ.",
      en: "And these words, which I command thee this day, shall be upon thy heart.",
    },
    {
      he: "וְשִׁנַּנְתָּם לְבָנֶיךָ וְדִבַּרְתָּ בָּם, בְּשִׁבְתְּךָ בְּבֵיתֶךָ וּבְלֶכְתְּךָ בַדֶּרֶךְ, וּבְשָׁכְבְּךָ וּבְקוּמֶךָ.",
      en: "And thou shalt teach them diligently unto thy children, and shalt talk of them when thou sittest in thy house, and when thou walkest by the way, and when thou liest down, and when thou risest up.",
    },
    {
      he: "וּקְשַׁרְתָּם לְאוֹת עַל יָדֶךָ, וְהָיוּ לְטֹטָפֹת בֵּין עֵינֶיךָ.",
      en: "And thou shalt bind them for a sign upon thy hand, and they shall be for frontlets between thine eyes.",
    },
    {
      he: "וּכְתַבְתָּם עַל מְזֻזוֹת בֵּיתֶךָ וּבִשְׁעָרֶיךָ.",
      en: "And thou shalt write them upon the doorposts of thy house, and upon thy gates.",
    },
  ],
};

const ALEINU: PrayerSection = {
  id: "aleinu",
  heading: "Aleinu (opening)",
  hebrewHeading: "עָלֵינוּ",
  lines: [
    {
      he: "עָלֵינוּ לְשַׁבֵּחַ לַאֲדוֹן הַכֹּל, לָתֵת גְּדֻלָּה לְיוֹצֵר בְּרֵאשִׁית.",
      en: "It is our duty to praise the Master of all, to ascribe greatness to the Author of creation.",
    },
    {
      he: "שֶׁלֹּא עָשָׂנוּ כְּגוֹיֵי הָאֲרָצוֹת, וְלֹא שָׂמָנוּ כְּמִשְׁפְּחוֹת הָאֲדָמָה.",
      en: "Who hath not made us like the nations of the lands, nor placed us like the families of the earth.",
    },
    {
      he: "וַאֲנַחְנוּ כּוֹרְעִים וּמִשְׁתַּחֲוִים וּמוֹדִים, לִפְנֵי מֶלֶךְ מַלְכֵי הַמְּלָכִים, הַקָּדוֹשׁ בָּרוּךְ הוּא.",
      en: "But we bend the knee and bow and give thanks before the supreme King of kings, the Holy One, blessed be He.",
    },
  ],
};

const BARCHU: PrayerSection = {
  id: "barchu",
  heading: "Barchu",
  hebrewHeading: "בָּרְכוּ",
  lines: [
    { he: "בָּרְכוּ אֶת יְיָ הַמְבֹרָךְ.", en: "Bless ye the Lord who is to be blessed." },
    {
      he: "בָּרוּךְ יְיָ הַמְבֹרָךְ לְעוֹלָם וָעֶד.",
      en: "Blessed be the Lord who is to be blessed for ever and ever.",
    },
  ],
};

/* --------------------------------------------------------------- prayers */

export const PRAYERS: Prayer[] = [
  {
    id: "shacharit",
    categoryId: "shacharit",
    title: "Shacharit",
    hebrewTitle: "שַׁחֲרִית",
    blurb: "Morning service — the sections most people daven from memory, in order.",
    when: "From dawn until a third of the day",
    source: "Traditional liturgy (public domain). English rendering after the 1917 JPS phrasing.",
    pending: ["Birchot HaShachar in full", "Pesukei DeZimra", "Birchot Kriat Shema", "The Amidah", "Tachanun"],
    text: {
      ashkenaz: [MODEH_ANI, MAH_TOVU, ASHREI, SHEMA, ALEINU],
    },
  },
  {
    id: "mincha",
    categoryId: "mincha",
    title: "Mincha",
    hebrewTitle: "מִנְחָה",
    blurb: "Afternoon service — Ashrei through Aleinu.",
    when: "From half an hour after midday until sunset",
    source: "Traditional liturgy (public domain). English rendering after the 1917 JPS phrasing.",
    pending: ["The Amidah", "Tachanun"],
    text: {
      ashkenaz: [ASHREI, ALEINU],
    },
  },
  {
    id: "maariv",
    categoryId: "maariv",
    title: "Maariv",
    hebrewTitle: "מַעֲרִיב",
    blurb: "Evening service — Barchu, Shema and Aleinu.",
    when: "From nightfall",
    source: "Traditional liturgy (public domain). English rendering after the 1917 JPS phrasing.",
    pending: ["Birchot Kriat Shema", "Hashkiveinu", "The Amidah"],
    text: {
      ashkenaz: [BARCHU, SHEMA, ALEINU],
    },
  },
  {
    id: "shema-al-hamita",
    categoryId: "shema-sleep",
    title: "Shema before sleeping",
    hebrewTitle: "קְרִיאַת שְׁמַע עַל הַמִּטָּה",
    blurb: "The bedtime Shema, said last thing at night.",
    when: "Before going to sleep",
    source: "Traditional liturgy (public domain). English rendering after the 1917 JPS phrasing.",
    pending: ["HaMapil in full", "Adon Olam", "Psalm 91 (Yoshev BeSeter)"],
    text: {
      ashkenaz: [
        {
          id: "vidui-short",
          heading: "Before the Shema",
          lines: [
            {
              he: "רִבּוֹנוֹ שֶׁל עוֹלָם, הֲרֵינִי מוֹחֵל לְכָל מִי שֶׁהִכְעִיס וְהִקְנִיט אוֹתִי, אוֹ שֶׁחָטָא כְּנֶגְדִּי.",
              en: "Master of the universe, I hereby forgive anyone who has angered or provoked me, or who has sinned against me.",
            },
          ],
        },
        SHEMA,
        {
          id: "hamalach",
          heading: "HaMalach HaGoel",
          hebrewHeading: "הַמַּלְאָךְ הַגּוֹאֵל",
          lines: [
            {
              he: "הַמַּלְאָךְ הַגֹּאֵל אֹתִי מִכָּל רָע יְבָרֵךְ אֶת הַנְּעָרִים, וְיִקָּרֵא בָהֶם שְׁמִי וְשֵׁם אֲבֹתַי אַבְרָהָם וְיִצְחָק, וְיִדְגּוּ לָרֹב בְּקֶרֶב הָאָרֶץ.",
              en: "The angel who hath redeemed me from all evil, bless the lads; and let my name be named in them, and the name of my fathers Abraham and Isaac; and let them grow into a multitude in the midst of the earth.",
            },
          ],
        },
      ],
    },
  },
  {
    id: "tefilat-haderech",
    categoryId: "tefilat-haderech",
    title: "Tefilat HaDerech",
    hebrewTitle: "תְּפִלַּת הַדֶּרֶךְ",
    blurb: "Said once, after leaving the city, on any journey out of town.",
    when: "On the road — buses, trains, sherut, flights",
    source:
      "Traditional liturgy (public domain), text as in Berachot 29b and standard siddurim; common to the nusachim listed.",
    text: {
      ashkenaz: [
        {
          id: "body",
          heading: "The traveller's prayer",
          lines: [
            {
              he: "יְהִי רָצוֹן מִלְּפָנֶיךָ יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, שֶׁתּוֹלִיכֵנוּ לְשָׁלוֹם וְתַצְעִידֵנוּ לְשָׁלוֹם וְתַדְרִיכֵנוּ לְשָׁלוֹם, וְתַגִּיעֵנוּ לִמְחוֹז חֶפְצֵנוּ לְחַיִּים וּלְשִׂמְחָה וּלְשָׁלוֹם.",
              en: "May it be Your will, Lord our God and God of our fathers, that You lead us toward peace, guide our footsteps toward peace, and make us reach our desired destination for life, gladness and peace.",
            },
            {
              he: "וְתַצִּילֵנוּ מִכַּף כָּל אוֹיֵב וְאוֹרֵב וְלִסְטִים וְחַיּוֹת רָעוֹת בַּדֶּרֶךְ, וּמִכָּל מִינֵי פֻּרְעָנֻיּוֹת הַמִּתְרַגְּשׁוֹת לָבוֹא לָעוֹלָם.",
              en: "Rescue us from the hand of every foe, ambush, bandits and wild animals along the way, and from all manner of calamities that come into the world.",
            },
            {
              he: "וְתִשְׁלַח בְּרָכָה בְּכָל מַעֲשֵׂה יָדֵינוּ, וְתִתְּנֵנִי לְחֵן וּלְחֶסֶד וּלְרַחֲמִים בְּעֵינֶיךָ וּבְעֵינֵי כָל רוֹאֵינוּ, וְתִשְׁמַע קוֹל תַּחֲנוּנֵינוּ, כִּי אֵל שׁוֹמֵעַ תְּפִלָּה וְתַחֲנוּן אָתָּה.",
              en: "Send blessing on all the work of our hands; grant me grace, kindness and mercy in Your eyes and in the eyes of all who see us, and hear the sound of our supplication — for You are God who hears prayer and supplication.",
            },
            {
              he: "בָּרוּךְ אַתָּה יְיָ, שׁוֹמֵעַ תְּפִלָּה.",
              en: "Blessed are You, Lord, who hears prayer.",
            },
          ],
        },
      ],
    },
  },
  {
    id: "birkat-hamazon",
    categoryId: "birkat-hamazon",
    title: "Birkat Hamazon",
    hebrewTitle: "בִּרְכַּת הַמָּזוֹן",
    blurb: "Grace after a meal with bread. First blessing transcribed.",
    when: "After a meal with bread",
    source: "Traditional liturgy (public domain). English rendering after the 1917 JPS phrasing.",
    pending: ["Birkat HaAretz", "Boneh Yerushalayim", "HaTov VeHaMeitiv", "HaRachaman verses", "Zimun"],
    text: {
      ashkenaz: [
        {
          id: "hazan",
          heading: "Birkat HaZan — first blessing",
          hebrewHeading: "הַזָּן אֶת הַכֹּל",
          lines: [
            {
              he: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הַזָּן אֶת הָעוֹלָם כֻּלּוֹ בְּטוּבוֹ, בְּחֵן בְּחֶסֶד וּבְרַחֲמִים.",
              en: "Blessed are You, Lord our God, King of the universe, who nourishes the whole world in His goodness, with grace, with kindness and with mercy.",
            },
            {
              he: "הוּא נוֹתֵן לֶחֶם לְכָל בָּשָׂר, כִּי לְעוֹלָם חַסְדּוֹ.",
              en: "He gives bread to all flesh, for His kindness endures for ever.",
            },
            {
              he: "וּבְטוּבוֹ הַגָּדוֹל תָּמִיד לֹא חָסַר לָנוּ, וְאַל יֶחְסַר לָנוּ מָזוֹן לְעוֹלָם וָעֶד.",
              en: "Through His great goodness we have never lacked, and may we never lack food, for ever and ever.",
            },
            {
              he: "בָּרוּךְ אַתָּה יְיָ, הַזָּן אֶת הַכֹּל.",
              en: "Blessed are You, Lord, who nourishes all.",
            },
          ],
        },
      ],
    },
  },
  {
    id: "brachot",
    categoryId: "brachot",
    title: "Common brachot",
    hebrewTitle: "בְּרָכוֹת",
    blurb: "The everyday blessings — bread, wine, fruit, and the rest.",
    when: "Whenever you eat, drink or see something new",
    source: "Traditional blessings (public domain); wording common to all nusachim.",
    text: {
      ashkenaz: BRACHOT_SECTIONS(),
      sephard: BRACHOT_SECTIONS(),
      edot: BRACHOT_SECTIONS(),
    },
  },
  {
    id: "havdalah",
    categoryId: "havdalah",
    title: "Havdalah",
    hebrewTitle: "הַבְדָּלָה",
    blurb: "The four blessings that close Shabbat.",
    when: "Motzei Shabbat, after nightfall",
    source: "Traditional liturgy (public domain); blessing text common to the nusachim listed.",
    pending: ["Hinei El Yeshuati introductory verses", "Eliyahu HaNavi", "HaMavdil (zemer)"],
    text: {
      ashkenaz: HAVDALAH_SECTIONS(),
      sephard: HAVDALAH_SECTIONS(),
    },
  },
];

function BRACHOT_SECTIONS(): PrayerSection[] {
  return [
    {
      id: "hamotzi",
      heading: "Bread — HaMotzi",
      lines: [
        {
          he: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הַמּוֹצִיא לֶחֶם מִן הָאָרֶץ.",
          en: "Blessed are You, Lord our God, King of the universe, who brings forth bread from the earth.",
        },
      ],
    },
    {
      id: "mezonot",
      heading: "Cake, pastry, pasta — Mezonot",
      lines: [
        {
          he: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, בּוֹרֵא מִינֵי מְזוֹנוֹת.",
          en: "Blessed are You, Lord our God, King of the universe, who creates varieties of nourishment.",
        },
      ],
    },
    {
      id: "hagafen",
      heading: "Wine & grape juice — HaGafen",
      lines: [
        {
          he: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, בּוֹרֵא פְּרִי הַגָּפֶן.",
          en: "Blessed are You, Lord our God, King of the universe, who creates the fruit of the vine.",
        },
      ],
    },
    {
      id: "haetz",
      heading: "Fruit from a tree — HaEtz",
      lines: [
        {
          he: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, בּוֹרֵא פְּרִי הָעֵץ.",
          en: "Blessed are You, Lord our God, King of the universe, who creates the fruit of the tree.",
        },
      ],
    },
    {
      id: "haadama",
      heading: "Vegetables & ground fruit — HaAdama",
      lines: [
        {
          he: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, בּוֹרֵא פְּרִי הָאֲדָמָה.",
          en: "Blessed are You, Lord our God, King of the universe, who creates the fruit of the ground.",
        },
      ],
    },
    {
      id: "shehakol",
      heading: "Everything else — Shehakol",
      lines: [
        {
          he: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁהַכֹּל נִהְיָה בִּדְבָרוֹ.",
          en: "Blessed are You, Lord our God, King of the universe, by whose word all things came to be.",
        },
      ],
    },
    {
      id: "shehecheyanu",
      heading: "Something new — Shehecheyanu",
      lines: [
        {
          he: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁהֶחֱיָנוּ וְקִיְּמָנוּ וְהִגִּיעָנוּ לַזְּמַן הַזֶּה.",
          en: "Blessed are You, Lord our God, King of the universe, who has kept us alive, sustained us, and brought us to this season.",
        },
      ],
    },
  ];
}

function HAVDALAH_SECTIONS(): PrayerSection[] {
  return [
    {
      id: "wine",
      heading: "Over the wine",
      lines: [
        {
          he: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, בּוֹרֵא פְּרִי הַגָּפֶן.",
          en: "Blessed are You, Lord our God, King of the universe, who creates the fruit of the vine.",
        },
      ],
    },
    {
      id: "besamim",
      heading: "Over the spices",
      lines: [
        {
          he: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, בּוֹרֵא מִינֵי בְשָׂמִים.",
          en: "Blessed are You, Lord our God, King of the universe, who creates varieties of spices.",
        },
      ],
    },
    {
      id: "esh",
      heading: "Over the flame",
      lines: [
        {
          he: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, בּוֹרֵא מְאוֹרֵי הָאֵשׁ.",
          en: "Blessed are You, Lord our God, King of the universe, who creates the lights of the fire.",
        },
      ],
    },
    {
      id: "hamavdil",
      heading: "HaMavdil — the separation",
      lines: [
        {
          he: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הַמַּבְדִּיל בֵּין קֹדֶשׁ לְחוֹל, בֵּין אוֹר לְחֹשֶׁךְ, בֵּין יִשְׂרָאֵל לָעַמִּים, בֵּין יוֹם הַשְּׁבִיעִי לְשֵׁשֶׁת יְמֵי הַמַּעֲשֶׂה.",
          en: "Blessed are You, Lord our God, King of the universe, who separates between holy and everyday, between light and darkness, between Israel and the nations, between the seventh day and the six days of work.",
        },
        {
          he: "בָּרוּךְ אַתָּה יְיָ, הַמַּבְדִּיל בֵּין קֹדֶשׁ לְחוֹל.",
          en: "Blessed are You, Lord, who separates between holy and everyday.",
        },
      ],
    },
  ];
}

export function findPrayer(id: string): Prayer | undefined {
  return PRAYERS.find((p) => p.id === id);
}

export function prayersInCategory(categoryId: string): Prayer[] {
  return PRAYERS.filter((p) => p.categoryId === categoryId);
}

export function nusachAvailability(prayer: Prayer): NusachId[] {
  return NUSACHIM.map((n) => n.id).filter((id) => (prayer.text[id]?.length ?? 0) > 0);
}

export function searchPrayers(query: string): Prayer[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRAYERS.filter((p) =>
    `${p.title} ${p.hebrewTitle} ${p.blurb} ${p.when} ${
      SIDDUR_CATEGORIES.find((c) => c.id === p.categoryId)?.label ?? ""
    }`
      .toLowerCase()
      .includes(q),
  );
}
