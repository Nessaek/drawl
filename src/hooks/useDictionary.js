import { useState, useEffect } from 'react';

const FALLBACK = new Set([
  'AT','BE','BY','DO','GO','HE','HI','IF','IN','IS','IT','ME','MY','NO','OF','ON','OR',
  'SO','TO','UP','US','WE','ATE','BIG','BOX','BUT','CAT','CUP','CUT','DAY','DIG','DIP',
  'DOG','EAT','EGG','END','FAR','FIG','FIN','FIT','FLY','FOR','FUN','GET','GOT','GUN',
  'HAD','HAS','HAT','HIM','HIS','HOT','HOW','HUT','ICE','JOG','JOY','JUG','KID','LAP',
  'LAW','LAY','LET','LID','LIP','LIT','LOG','LOT','LOW','MAP','MAT','MIX','MOP','NET',
  'NEW','NIT','NUN','NUT','ODD','OLD','ONE','OUR','OUT','OWN','PAD','PAT','PAY','PEG',
  'PEN','PET','PIE','PIG','PIN','PIT','POT','PUT','RAG','RAN','RAP','RAT','RAW','RED',
  'RIB','RID','RIG','RIP','ROB','ROD','ROT','ROW','RUG','RUN','RUT','SAP','SAT','SAW',
  'SAY','SET','SEW','SIN','SIP','SIT','SIX','SKI','SKY','SLY','SOB','SON','SOT','SOW',
  'SOY','SPA','SPY','STY','SUM','SUN','TAB','TAN','TAP','TAR','TAX','TEN','TIP','TON',
  'TOO','TOP','TOT','TOW','TOY','TUB','TUG','TUN','TWO','URN','VAN','VAT','VIA','VIE',
  'VOW','WAN','WAR','WAS','WAX','WAY','WEB','WED','WET','WHO','WHY','WIG','WIN','WIT',
  'WOE','WOK','WON','WOO','WOW','YAK','YAM','YAP','YAW','YEA','YES','YET','YEW','ZAP',
  'ZEN','ZIP','ZIT','ABLE','ACID','AGED','ALSO','AREA','ARMY','AWAY','BABY','BACK','BALL',
  'BAND','BANK','BASE','BATH','BEAR','BEAT','BEEN','BELT','BEST','BIRD','BITE','BLOW',
  'BLUE','BOAT','BODY','BONE','BOOK','BORN','BOTH','BOWL','BURN','CAFE','CAKE','CALL',
  'CALM','CAME','CARD','CARE','CART','CASE','CAST','CAVE','CENT','CHEF','CHIP','CITY',
  'CLAM','CLAN','CLAP','CLAY','CLIP','CLUB','CLUE','COAL','COAT','CODE','COIL','COIN',
  'COLD','COME','COOK','COOL','COPE','COPY','CORD','CORE','CORK','CORN','COST','COZY',
  'CRAM','CREW','CROP','CROW','CUBE','CURE','CURL','DAMP','DARE','DARK','DART','DASH',
  'DATE','DAWN','DEAD','DEAL','DEAR','DEBT','DECK','DEED','DEEP','DENY','DESK','DIET',
  'DINE','DIRE','DIRT','DISC','DISH','DISK','DIVE','DOES','DOME','DONE','DOOR','DOSE',
  'DOTE','DOVE','DOWN','DRAG','DRAW','DREW','DRIP','DROP','DRUM','DUAL','DULL','DUMB',
  'DUMP','DUNE','DUSK','DUST','DUTY','EACH','EARL','EARN','EASE','EAST','EDGE','EPIC',
  'EVEN','EVER','EVIL','EXAM','FACE','FACT','FAIL','FAIR','FAKE','FALL','FAME','FARM',
  'FAST','FATE','FEAR','FEAT','FEEL','FEET','FELL','FELT','FILE','FILL','FILM','FIND',
  'FINE','FIRE','FIRM','FISH','FIST','FIZZ','FLAG','FLAT','FLAW','FLEA','FLEW','FLEX',
  'FLIP','FLIT','FLOCK','FLOW','FOAM','FOLD','FOLK','FOND','FONT','FOOD','FOOL','FOOT',
  'FORD','FORE','FORK','FORM','FORT','FOUL','FOUR','FREE','FROM','FUEL','FULL','FUME',
  'FUND','FUSE','FUSS','GAIN','GAME','GANG','GASP','GATE','GAVE','GAZE','GEAR','GENE',
  'GIFT','GIRL','GIVE','GLAD','GLOW','GLUE','GLUM','GNAW','GOAL','GOAT','GOES','GOLD',
  'GOLF','GONE','GOOD','GRAB','GRAY','GREW','GRIN','GRIP','GRIT','GROW','GULF','GUST',
  'GUTS','HACK','HAIL','HALF','HALL','HAND','HANG','HARD','HARE','HARM','HARP','HATE',
  'HAVE','HAWK','HAZE','HEAD','HEAL','HEAP','HEAR','HEAT','HEEL','HELD','HELP','HERB',
  'HERE','HERO','HIGH','HIKE','HILL','HINT','HIRE','HOLD','HOLE','HOME','HOOK','HOPE',
  'HORN','HOST','HOUR','HUGE','HULL','HUMP','HUNG','HUNT','HURT','IDEA','IDLE','INCH',
  'INTO','IRON','ISLE','ITCH','ITEM','JACK','JADE','JAIL','JAMS','JAZZ','JERK','JEST',
  'JEWEL','JOIN','JOKE','JUMP','JUNK','JUST','KEEN','KEEP','KICK','KIND','KING','KISS',
  'KNIT','KNOB','KNOW','LACE','LACK','LAID','LAKE','LAME','LAND','LANE','LARD','LARK',
  'LAST','LATE','LAUD','LEAN','LEAP','LEARN','LEFT','LEND','LENS','LESS','LICK','LIFE',
  'LIFT','LIKE','LIME','LINE','LINK','LION','LIST','LIVE','LOAD','LOAN','LOCK','LOFT',
  'LONE','LONG','LOOK','LOOP','LORE','LOSE','LOSS','LOST','LOUD','LOVE','LUCK','LUNG',
  'MAID','MAIL','MAIN','MAKE','MALE','MALL','MALT','MANE','MANY','MARK','MAST','MATE',
  'MAZE','MEAL','MEAN','MEAT','MEET','MELT','MEMO','MEND','MENU','MERE','MESH','MILD',
  'MILE','MILK','MILL','MIME','MIND','MINE','MINT','MISS','MIST','MODE','MOLE','MOLT',
  'MOOD','MOON','MOOR','MORE','MOST','MOTH','MOVE','MUCH','MULE','MUSE','MUST','MYTH',
  'NAIL','NAME','NEAR','NECK','NEED','NEST','NEWS','NEXT','NICE','NINE','NODE','NONE',
  'NOON','NORM','NOSE','NOTE','NOUN','NUDE','NUMB','OATH','OBEY','OKAY','ONCE','ONLY',
  'OPEN','ORAL','OVEN','OVER','OWED','PAIR','PALE','PALM','PARK','PART','PASS','PAST',
  'PATH','PAVE','PEAK','PEAR','PEEL','PEER','PERM','PEST','PICK','PIER','PINE','PINK',
  'PIPE','PLAN','PLAY','PLEA','PLOD','PLOT','PLOW','PLUG','PLUM','PLUS','POEM','POET',
  'POLE','POLL','POND','PONY','POOL','POOR','PORE','PORT','POSE','POST','POUR','PREY',
  'PROP','PULL','PUMP','PURE','PUSH','QUIZ','RACE','RACK','RAGE','RAID','RAIL','RAIN',
  'RAKE','RAMP','RANG','RANK','RARE','RASH','RATE','RAVE','RAZZ','READ','REAL','REAP',
  'REED','REEF','REEL','RELY','RENT','REST','RICE','RICH','RIDE','RIFE','RING','RIOT',
  'RISE','RISK','ROAM','ROAR','ROBE','ROCK','RODE','ROLE','ROLL','ROOF','ROOM','ROOT',
  'ROPE','ROSE','ROUT','ROVE','RULE','RUSE','RUSH','RUST','RUTS','SAFE','SAGE','SAID',
  'SAIL','SAKE','SALT','SAME','SAND','SANE','SANG','SANK','SAVE','SEAL','SEAM','SEAT',
  'SEED','SEEK','SEEM','SEEN','SELF','SELL','SEND','SENT','SHED','SHIN','SHIP','SHOE',
  'SHOP','SHOT','SHOW','SICK','SIDE','SIGH','SIGN','SILK','SING','SINK','SIZE','SKIN',
  'SKIP','SLAM','SLAP','SLIM','SLIP','SLIT','SLOW','SLUG','SLUM','SNAP','SOAR','SOCK',
  'SOFT','SOIL','SOLD','SOLE','SONG','SOON','SORE','SOUL','SOUP','SOUR','SPAN','SPIT',
  'SPOT','SPUR','STAR','STAY','STEP','STEM','STEW','STOP','STUB','STUN','SUCH','SUIT',
  'SURE','SURF','SWAM','SWAP','SWAT','SWIM','TAIL','TALE','TALL','TAME','TANG','TAPE',
  'TASK','TAUT','TAXI','TEAL','TEAM','TEAR','TEEM','TELL','TEMP','TEND','TENT','TEST',
  'TEXT','THAN','THAT','THEM','THEN','THEY','THIN','THIS','THORN','THUS','TIDE','TIED',
  'TIER','TILE','TILL','TIME','TINY','TIRE','TOAD','TOLD','TOLL','TOMB','TONE','TOOK',
  'TOOL','TOPS','TORE','TORN','TOSS','TOUR','TOWN','TRAP','TRAY','TREE','TRIM','TRIO',
  'TRIP','TRUE','TUBE','TUCK','TUFT','TUNE','TURF','TURN','TWIG','TWIN','TYPE','UGLY',
  'UNDO','UNIT','UPON','USED','USER','VAIN','VALE','VANE','VARY','VAST','VEIL','VEIN',
  'VENT','VERB','VERY','VEST','VIEW','VILE','VINE','VISA','VOID','VOLT','VOTE','WADE',
  'WAGE','WAIL','WAIT','WAKE','WALK','WALL','WAND','WANT','WARD','WARM','WARN','WARP',
  'WART','WASH','WASP','WAVE','WEAK','WEAL','WEAN','WEAR','WEED','WEEK','WELL','WENT',
  'WEST','WHAT','WHEN','WHIM','WHIP','WHIT','WHOM','WICK','WIDE','WIFE','WILD','WILL',
  'WILT','WIND','WINE','WING','WINK','WIRE','WISE','WISH','WITH','WOKE','WOLF','WOOD',
  'WORD','WORE','WORK','WORM','WORN','WOVE','WRAP','WREN','WRIT','YEAR','YELL','YOGA',
  'YOKE','YORE','YOUR','ZONE','ZOOM','STONE','TONES','NOTES','BLAST','PLANT','PLACE',
  'TRACE','GRACE','SPACE','SCALE','STALE','STORE','SCORE','SLICE','SPINE','SPIRE',
  'STARE','SKATE','PLATE','STATE','FLAME','BLAME','CRANE','DRAIN','TRAIN','PLAIN',
  'GRAIN','BRAIN','SNARE','GLARE','FLARE','SPARE','STARE','SWEAR','SMEAR','SPEAR',
]);

export function useDictionary() {
  const [wordSet, setWordSet] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | fallback

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt'
        );
        if (!res.ok) throw new Error('fetch failed');
        const text = await res.text();
        if (cancelled) return;
        const set = new Set(
          text.split('\n').map(w => w.trim().toUpperCase()).filter(w => w.length >= 2)
        );
        setWordSet(set);
        setStatus('ready');
      } catch {
        if (cancelled) return;
        setWordSet(FALLBACK);
        setStatus('fallback');
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { wordSet, status };
}
