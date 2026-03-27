import AsyncStorage from '@react-native-async-storage/async-storage';
import { Verse } from './types';

const DAILY_VERSES: { ref: string; text: string }[] = [
  { ref: 'John 3:16', text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
  { ref: 'Psalm 23:1', text: 'The LORD is my shepherd; I shall not want.' },
  { ref: 'Philippians 4:13', text: 'I can do all things through Christ which strengtheneth me.' },
  { ref: 'Romans 8:28', text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.' },
  { ref: 'Jeremiah 29:11', text: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.' },
  { ref: 'Proverbs 3:5-6', text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.' },
  { ref: 'Isaiah 40:31', text: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.' },
  { ref: 'Psalm 46:1', text: 'God is our refuge and strength, a very present help in trouble.' },
  { ref: 'Matthew 11:28', text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.' },
  { ref: 'Romans 12:2', text: 'And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.' },
  { ref: 'Psalm 119:105', text: 'Thy word is a lamp unto my feet, and a light unto my path.' },
  { ref: 'Joshua 1:9', text: 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.' },
  { ref: 'Psalm 37:4', text: 'Delight thyself also in the LORD; and he shall give thee the desires of thine heart.' },
  { ref: 'Romans 8:38-39', text: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come, Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.' },
  { ref: 'Galatians 5:22-23', text: 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law.' },
  { ref: '2 Timothy 1:7', text: 'For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.' },
  { ref: 'Hebrews 11:1', text: 'Now faith is the substance of things hoped for, the evidence of things not seen.' },
  { ref: 'Psalm 27:1', text: 'The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?' },
  { ref: '1 Corinthians 13:4-5', text: 'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up, Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil.' },
  { ref: 'Matthew 6:33', text: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.' },
  { ref: 'Psalm 91:1-2', text: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust.' },
  { ref: 'Isaiah 41:10', text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.' },
  { ref: 'Ephesians 2:8-9', text: 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.' },
  { ref: 'Philippians 4:6-7', text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.' },
  { ref: 'Psalm 34:8', text: 'O taste and see that the LORD is good: blessed is the man that trusteth in him.' },
  { ref: 'Matthew 5:16', text: 'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.' },
  { ref: 'Colossians 3:23', text: 'And whatsoever ye do, do it heartily, as to the Lord, and not unto men.' },
  { ref: '1 Peter 5:7', text: 'Casting all your care upon him; for he careth for you.' },
  { ref: 'Psalm 139:14', text: 'I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well.' },
  { ref: 'Romans 15:13', text: 'Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.' },
  { ref: 'Lamentations 3:22-23', text: 'It is of the LORD\'s mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.' },
];

export function getDailyVerse(): { ref: string; text: string } {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const index = dayOfYear % DAILY_VERSES.length;
  return DAILY_VERSES[index];
}

export async function isFavoriteVerse(ref: string): Promise<boolean> {
  const favorites = await getFavoriteVerses();
  return favorites.includes(ref);
}

export async function toggleFavoriteVerse(ref: string): Promise<void> {
  const favorites = await getFavoriteVerses();
  if (favorites.includes(ref)) {
    await AsyncStorage.setItem(
      'favorite_verses',
      JSON.stringify(favorites.filter(f => f !== ref))
    );
  } else {
    await AsyncStorage.setItem(
      'favorite_verses',
      JSON.stringify([...favorites, ref])
    );
  }
}

export async function getFavoriteVerses(): Promise<string[]> {
  const data = await AsyncStorage.getItem('favorite_verses');
  return data ? JSON.parse(data) : [];
}
