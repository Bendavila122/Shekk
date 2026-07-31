/**
 * "Been There" — an interactive map of Israel.
 *
 * Areas are the country's real subdistricts plus the Shomron / Yehuda
 * governorates, generated from geoBoundaries (CC0) into `israel-geo.ts`, so
 * the outlines are the actual borders rather than hand-drawn boxes.
 *
 * Places are stored in lon/lat and projected into the same SVG space, so pins
 * always sit inside the right area.
 */

import {
  LAT_MAX,
  LON_MIN,
  LON_SCALE,
  MAP_HEIGHT,
  MAP_WIDTH,
  PROJ_K,
  REGION_SHAPES,
  type RegionShape,
} from "@/lib/israel-geo";
import { MORE_PLACES } from "@/lib/israel-map-places";

export { MAP_HEIGHT, MAP_WIDTH, LON_SCALE };

export type Region = RegionShape;

export type Landmark = {
  /** Wikipedia page title — used for a real photo and live summary. */
  wiki: string;
  label: string;
};

export type MapPlace = {
  id: string;
  name: string;
  hebrew?: string;
  /** Legacy hand-assigned area; the real one is resolved from the geometry. */
  region?: string;
  kind: "city" | "holy" | "nature" | "beach" | "history";
  lat: number;
  lon: number;
  /** One line, in a student's language. */
  blurb: string;
  history: string;
  /** Things to do and see. */
  todo: string[];
  wiki: string;
  gallery: Landmark[];
};

/* ------------------------------------------------------------------ areas */

export const REGIONS: Region[] = REGION_SHAPES;

/* ------------------------------------------------------------------ places */

const CORE_PLACES: MapPlace[] = [

  {
    id: "kotel",
    name: "Western Wall",
    hebrew: "הכותל המערבי",
    region: "jerusalem",
    kind: "holy",
    lat: 31.7767,
    lon: 35.2345,
    blurb: "The retaining wall of the Temple Mount, and the beating heart of the Old City.",
    history:
      "Built as part of Herod's expansion of the Second Temple complex in the first century BCE, the Kotel is the closest accessible point to where the Temple stood. It has been a place of Jewish prayer for centuries and, since 1967, has been open to visitors around the clock.",
    todo: [
      "Daven at the plaza — minyanim run roughly every 20 minutes",
      "Walk the Western Wall Tunnels for the Herodian street below",
      "Come Friday night for Kabbalat Shabbat with the yeshivot",
      "Combine with the Jewish Quarter, Cardo and the Hurva Synagogue",
    ],
    wiki: "Western_Wall",
    gallery: [
      { wiki: "Western_Wall", label: "The Kotel plaza" },
      { wiki: "Old_City_(Jerusalem)", label: "Old City" },
      { wiki: "Temple_Mount", label: "Temple Mount" },
    ],
  },
  {
    id: "machane-yehuda",
    name: "Machane Yehuda",
    hebrew: "מחנה יהודה",
    region: "jerusalem",
    kind: "city",
    lat: 31.7847,
    lon: 35.2124,
    blurb: "Jerusalem's shuk: produce and rugelach by day, bars and graffiti by night.",
    history:
      "The market grew informally in the late Ottoman period as farmers sold outside the new neighbourhoods west of the Old City. It was formalised in the 1930s under the British Mandate and renovated in the 2000s, when the night-time bar scene took over the shuttered stalls.",
    todo: [
      "Thursday afternoon before Shabbat for the full chaos",
      "Rugelach at Marzipan, halva at Halva Kingdom",
      "Night out along Etz Chaim after the stalls close",
      "Pay by card at most stalls, keep cash for the produce rows",
    ],
    wiki: "Mahane_Yehuda_Market",
    gallery: [
      { wiki: "Mahane_Yehuda_Market", label: "The shuk" },
      { wiki: "Jaffa_Road", label: "Jaffa Road" },
    ],
  },
  {
    id: "mount-of-olives",
    name: "Mount of Olives",
    region: "jerusalem",
    kind: "history",
    lat: 31.7784,
    lon: 35.2465,
    blurb: "The oldest Jewish cemetery in the world, and the classic Old City view.",
    history:
      "Jews have been buried on the ridge east of the Old City for some three thousand years. The slope holds around 150,000 graves, including Ramban-era sages, the Ohr HaChaim and modern figures, and was vandalised while under Jordanian control between 1948 and 1967.",
    todo: [
      "Sunrise from the lookout above Har HaZeitim",
      "Walk down to Gethsemane and up through the Kidron valley",
      "Visit the kivrei tzadikim on the lower slope",
    ],
    wiki: "Mount_of_Olives",
    gallery: [{ wiki: "Mount_of_Olives", label: "Mount of Olives" }],
  },
  {
    id: "tel-aviv",
    name: "Tel Aviv",
    hebrew: "תל אביב",
    region: "center",
    kind: "city",
    lat: 32.0853,
    lon: 34.7818,
    blurb: "Beach city, Bauhaus blocks and the country's nightlife capital.",
    history:
      "Founded in 1909 as a garden suburb of Jaffa on empty dunes, Tel Aviv grew fast with the arrival of German-Jewish architects in the 1930s, leaving the White City — the world's largest collection of Bauhaus buildings, now a UNESCO site. Israel's independence was declared here in 1948.",
    todo: [
      "Rothschild Boulevard and Independence Hall",
      "Sunset at Gordon or Hilton beach, then the Port",
      "Carmel Market and Kerem HaTeimanim for food",
      "Tayelet walk south to Old Jaffa",
    ],
    wiki: "Tel_Aviv",
    gallery: [
      { wiki: "Tel_Aviv", label: "Tel Aviv" },
      { wiki: "White_City_(Tel_Aviv)", label: "The White City" },
      { wiki: "Jaffa", label: "Jaffa" },
    ],
  },
  {
    id: "jaffa",
    name: "Old Jaffa",
    hebrew: "יפו",
    region: "center",
    kind: "history",
    lat: 32.0537,
    lon: 34.7520,
    blurb: "One of the oldest ports on earth, ten minutes south of the Tel Aviv beach.",
    history:
      "Jaffa appears in Egyptian records over 3,500 years ago and in Tanach as the port where Yonah boarded his ship. Crusaders, Mamluks, Ottomans and Napoleon all fought over it; it was the main gateway for Jewish immigration until Tel Aviv's port opened in 1936.",
    todo: [
      "Flea market (Shuk HaPishpeshim) on a Friday morning",
      "Abrasha Park lookout over the coastline",
      "Fresh fish in the old port, then the Ottoman clock tower",
    ],
    wiki: "Jaffa",
    gallery: [{ wiki: "Jaffa", label: "Old Jaffa" }],
  },
  {
    id: "masada",
    name: "Masada",
    hebrew: "מצדה",
    region: "negev-north",
    kind: "history",
    lat: 31.3157,
    lon: 35.3535,
    blurb: "Herod's desert fortress above the Dead Sea — the sunrise hike everyone does.",
    history:
      "Herod fortified the plateau as a palace-refuge in the 30s BCE. After the destruction of the Second Temple, Jewish rebels held it until 73 CE, when the Roman Tenth Legion built a siege ramp; Josephus records that the defenders chose death over capture. Excavated by Yigael Yadin in the 1960s.",
    todo: [
      "Snake Path before dawn — start about an hour before sunrise",
      "Cable car down if your legs are finished",
      "Float in the Dead Sea at Ein Bokek afterwards",
      "Bring 3 litres of water per person, no shade up there",
    ],
    wiki: "Masada",
    gallery: [
      { wiki: "Masada", label: "Masada" },
      { wiki: "Dead_Sea", label: "Dead Sea" },
    ],
  },
  {
    id: "ein-gedi",
    name: "Ein Gedi",
    region: "negev-north",
    kind: "nature",
    lat: 31.4614,
    lon: 35.3888,
    blurb: "Waterfalls and ibex in a desert oasis on the Dead Sea shore.",
    history:
      "The oasis is named in Shir HaShirim and was where David hid from Shaul. A Chalcolithic temple and a Byzantine synagogue with a famous mosaic warning against revealing the town's balsam secret both sit within the reserve.",
    todo: [
      "David Stream to the Shulamit falls",
      "Nachal Arugot for the longer, quieter canyon",
      "Dead Sea beach at Kalia or Ein Bokek after",
    ],
    wiki: "Ein_Gedi",
    gallery: [{ wiki: "Ein_Gedi", label: "Ein Gedi" }],
  },
  {
    id: "tzfat",
    name: "Tzfat",
    hebrew: "צפת",
    region: "galilee",
    kind: "holy",
    lat: 32.9646,
    lon: 35.4960,
    blurb: "The mystical hill town where Kabbalah went mainstream.",
    history:
      "After the Spanish expulsion, Tzfat became the centre of Jewish learning in the Galilee: the Arizal, Rabbi Yosef Karo and the Alshich all taught here in the 1500s, and Lecha Dodi was written in these alleys. Earthquakes and the 1948 war reshaped the old quarter.",
    todo: [
      "Ari and Abuhav synagogues in the old city",
      "Artists' Quarter galleries",
      "Kabbalat Shabbat in a Breslov or Carlebach minyan",
      "Day trip on to Meron and Rashbi's kever",
    ],
    wiki: "Safed",
    gallery: [
      { wiki: "Safed", label: "Tzfat" },
      { wiki: "Meron,_Israel", label: "Meron" },
    ],
  },
  {
    id: "kinneret",
    name: "Kinneret",
    hebrew: "כנרת",
    region: "galilee",
    kind: "nature",
    lat: 32.8000,
    lon: 35.5833,
    blurb: "Israel's freshwater lake — kayaks, beaches and Tiberias on the shore.",
    history:
      "The Sea of Galilee has been the country's main water reservoir since the National Water Carrier opened in 1964. Tiberias on its western shore is one of the four holy cities and the burial place of the Rambam; the Sanhedrin sat here after Jerusalem fell.",
    todo: [
      "Kayak the Jordan at Kfar Blum",
      "Overnight beach camping at Tzemach or Dugit",
      "Rambam's kever and the hot springs in Tiberias",
      "Golan lookouts and wineries a short drive east",
    ],
    wiki: "Sea_of_Galilee",
    gallery: [
      { wiki: "Sea_of_Galilee", label: "Kinneret" },
      { wiki: "Tiberias", label: "Tiberias" },
    ],
  },
  {
    id: "haifa",
    name: "Haifa",
    hebrew: "חיפה",
    region: "carmel",
    kind: "city",
    lat: 32.8156,
    lon: 34.9892,
    blurb: "Mountain, port and the terraced Bahai gardens, with buses on Shabbat.",
    history:
      "Haifa grew from a small Ottoman port into Israel's industrial north after the British built the deep-water harbour in the 1930s. The Bahai shrine and its terraces, completed in 2001, are a UNESCO World Heritage site, and the city is known for Jewish-Arab coexistence.",
    todo: [
      "Bahai Gardens from the Louis Promenade down",
      "Wadi Nisnas and the German Colony for food",
      "Cable car to Stella Maris on the Carmel ridge",
      "Beach day at Dado, then Akko by train",
    ],
    wiki: "Haifa",
    gallery: [
      { wiki: "Haifa", label: "Haifa" },
      { wiki: "Bahá'í_World_Centre_buildings", label: "Bahai Gardens" },
    ],
  },
  {
    id: "akko",
    name: "Akko",
    hebrew: "עכו",
    region: "galilee",
    kind: "history",
    lat: 32.9281,
    lon: 35.0818,
    blurb: "Crusader tunnels, a walled port and the best hummus argument in Israel.",
    history:
      "Akko was the Crusaders' capital after Jerusalem fell in 1187, then rebuilt by the Ottomans, whose governor Jazzar Pasha held off Napoleon in 1799. The Crusader halls sit intact beneath the Ottoman city — a UNESCO site since 2001.",
    todo: [
      "Knights' Halls and the Templar tunnel",
      "Walk the sea walls at sunset",
      "Hummus at Said or Hummus Akko",
      "Rosh Hanikra grottoes 20 minutes north",
    ],
    wiki: "Acre,_Israel",
    gallery: [
      { wiki: "Acre,_Israel", label: "Akko" },
      { wiki: "Rosh_HaNikra_grottoes", label: "Rosh Hanikra" },
    ],
  },
  {
    id: "caesarea",
    name: "Caesarea",
    region: "sharon",
    kind: "history",
    lat: 32.5008,
    lon: 34.8919,
    blurb: "A Roman harbour city with an amphitheatre right on the Mediterranean.",
    history:
      "Herod built Caesarea Maritima and its artificial harbour around 22 BCE as the Roman capital of Judea. It is where Pontius Pilate governed, where the Great Revolt began, and where an inscription bearing Pilate's name was found. The aqueduct still runs along the beach.",
    todo: [
      "Amphitheatre and hippodrome in the national park",
      "Snorkel the sunken harbour",
      "Aqueduct beach for a quieter swim",
    ],
    wiki: "Caesarea_Maritima",
    gallery: [{ wiki: "Caesarea_Maritima", label: "Caesarea" }],
  },
  {
    id: "beer-sheva",
    name: "Be'er Sheva",
    hebrew: "באר שבע",
    region: "negev-north",
    kind: "city",
    lat: 31.2518,
    lon: 34.7913,
    blurb: "Capital of the Negev — Avraham's wells, a big university and cheap food.",
    history:
      "Named for the wells Avraham dug in Bereishit, Be'er Sheva was rebuilt by the Ottomans in 1900 and captured by the Allies in 1917. Since the 1950s it has absorbed waves of immigration and grown into the south's main city, anchored by Ben-Gurion University.",
    todo: [
      "Old City cafés on Smilansky Street",
      "Tel Be'er Sheva, a UNESCO biblical mound",
      "Bedouin market on Thursdays",
    ],
    wiki: "Beersheba",
    gallery: [{ wiki: "Beersheba", label: "Be'er Sheva" }],
  },
  {
    id: "mitzpe-ramon",
    name: "Mitzpe Ramon",
    region: "negev-central",
    kind: "nature",
    lat: 30.6094,
    lon: 34.8016,
    blurb: "A desert town on the rim of the Ramon crater — the darkest skies in Israel.",
    history:
      "Founded in 1951 as a camp for road workers building the route to Eilat, the town sits above Machtesh Ramon, a 40km erosion crater unique to this region. It is now a base for desert hiking, stargazing and a small artists' community.",
    todo: [
      "Rim walk and the Alpaca farm",
      "Stargazing with a desert astronomy guide",
      "Hike Mount Ardon or the Carpentry (HaMinsara)",
    ],
    wiki: "Mitzpe_Ramon",
    gallery: [
      { wiki: "Mitzpe_Ramon", label: "Mitzpe Ramon" },
      { wiki: "Makhtesh_Ramon", label: "Machtesh Ramon" },
    ],
  },
  {
    id: "eilat",
    name: "Eilat",
    hebrew: "אילת",
    region: "arava",
    kind: "beach",
    lat: 29.5581,
    lon: 34.9482,
    blurb: "Red Sea reefs, no VAT and the winter escape when Jerusalem is freezing.",
    history:
      "The site of biblical Etzion Geber, Eilat was taken in Operation Uvda in 1949 to secure Israel's access to the Red Sea. The 1956 and 1967 wars both turned on the Straits of Tiran, and since the 1970s the town has been Israel's main resort city.",
    todo: [
      "Snorkel or dive the Coral Beach reserve",
      "Underwater Observatory and the dolphin reef",
      "Timna Park's arches and ancient copper mines",
      "Red Canyon hike before the heat",
    ],
    wiki: "Eilat",
    gallery: [
      { wiki: "Eilat", label: "Eilat" },
      { wiki: "Timna_Valley", label: "Timna Valley" },
    ],
  },
  {
    id: "chevron",
    name: "Chevron",
    hebrew: "חברון",
    region: "jerusalem",
    kind: "holy",
    lat: 31.5246,
    lon: 35.1106,
    blurb: "Me'arat HaMachpela — the burial place of the Avot and Imahot.",
    history:
      "Avraham bought the cave from Ephron the Hittite; the massive enclosure above it was built by Herod and is the oldest continuously used Jewish prayer structure in the world. Jewish presence was cut off after the 1929 riots and renewed after 1967.",
    todo: [
      "Me'arat HaMachpela — check which side is open that week",
      "Ancient Chevron and Tel Rumeida",
      "Go with an organised group; check current travel guidance first",
    ],
    wiki: "Cave_of_the_Patriarchs",
    gallery: [{ wiki: "Cave_of_the_Patriarchs", label: "Me'arat HaMachpela" }],
  },
  {
    id: "beit-shemesh",
    name: "Beit Shemesh",
    region: "shfela",
    kind: "city",
    lat: 31.7248,
    lon: 34.9932,
    blurb: "Hills between Jerusalem and the coast, packed with Anglo families.",
    history:
      "Tel Beit Shemesh guarded the Sorek valley on the Israelite–Philistine frontier; the Aron passed through here on its way back from Philistine captivity. The modern city was founded in 1950 and has grown quickly with religious and Anglo immigration.",
    todo: [
      "Beit Guvrin bell caves nearby",
      "Sorek Cave stalactites",
      "Shabbat with an Anglo family in RBS",
    ],
    wiki: "Beit_Shemesh",
    gallery: [{ wiki: "Beit_Shemesh", label: "Beit Shemesh" }],
  },
  {
    id: "ashkelon",
    name: "Ashkelon",
    region: "shfela",
    kind: "beach",
    lat: 31.6688,
    lon: 34.5743,
    blurb: "Long southern beaches and a national park on the old Philistine port.",
    history:
      "One of the five Philistine cities and a major Canaanite port, Ashkelon traded for four thousand years before the Mamluks destroyed it in 1270. The modern city was rebuilt from 1950 and its national park still shows Roman columns falling into the sea.",
    todo: [
      "Ashkelon National Park at golden hour",
      "Delilah beach for a swim",
      "Canaanite gate — the oldest arched gate found anywhere",
    ],
    wiki: "Ashkelon",
    gallery: [{ wiki: "Ashkelon", label: "Ashkelon" }],
  },
];

export const KIND_META: Record<MapPlace["kind"], { label: string; emoji: string }> = {
  city: { label: "City", emoji: "🏙️" },
  holy: { label: "Holy site", emoji: "🕍" },
  nature: { label: "Nature", emoji: "🏞️" },
  beach: { label: "Beach", emoji: "🏖️" },
  history: { label: "History", emoji: "🏛️" },
};

export function findMapPlace(id: string) {
  return MAP_PLACES.find((p) => p.id === id) ?? null;
}

export function region(id: string) {
  return REGIONS.find((r) => r.id === id) ?? null;
}

/* -------------------------------------------------------------- projection */

const LON_MIN = 34.2;
const LON_MAX = 35.85;
const LAT_MIN = 29.45;
const LAT_MAX = 33.35;
const K = 220; // degrees → svg units

/** Equirectangular projection, squeezed by latitude so shapes stay honest. */
export const LON_SCALE = Math.cos((31.5 * Math.PI) / 180);

export const MAP_WIDTH = +((LON_MAX - LON_MIN) * LON_SCALE * K).toFixed(2);
export const MAP_HEIGHT = +((LAT_MAX - LAT_MIN) * K).toFixed(2);

export function project(lon: number, lat: number): [number, number] {
  return [
    +((lon - LON_MIN) * LON_SCALE * K).toFixed(2),
    +((LAT_MAX - lat) * K).toFixed(2),
  ];
}

export function ringToPath(ring: [number, number][]): string {
  return (
    ring
      .map(([lon, lat], i) => {
        const [x, y] = project(lon, lat);
        return `${i === 0 ? "M" : "L"}${x} ${y}`;
      })
      .join(" ") + " Z"
  );
}

/** Rough national outline, drawn over the areas so the country reads as one. */
export const OUTLINE: [number, number][] = [
  [35.10, 33.09],
  [35.58, 33.28],
  [35.78, 33.25],
  [35.63, 32.85],
  [35.57, 32.70],
  [35.55, 32.40],
  [35.53, 32.05],
  [35.52, 31.80],
  [35.50, 31.55],
  [35.37, 31.10],
  [35.20, 30.40],
  [35.00, 29.53],
  [34.92, 29.53],
  [34.58, 30.40],
  [34.27, 31.22],
  [34.48, 31.55],
  [34.55, 31.67],
  [34.65, 31.80],
  [34.76, 32.08],
  [34.89, 32.40],
  [34.95, 32.70],
  [34.95, 32.83],
  [35.07, 32.92],
];
