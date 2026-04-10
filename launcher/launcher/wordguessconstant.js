const fruits = [
 'apple','orange','mangoe','melon','tomatoe','lemon','grape'
];
const domesticAnimals = [
  'cow','goat','sheep','donkey','horse','pig','cat','dog'
];
const wildAnimals = [
  'lion','rhino','hyena','hippo','giraffe','monkey','leophard','zebra','pocupine','elephant','squirrel'
];
const countries = [
 'america','egypt','france','russia','uganda','malawi','angola','brazil','moscow','england','india','britain','chaina','germa','madagascar','Mozambique'
];
const plants = [
  'maize','beans','millet','peas','coffee','vanilla','cloves','pumpkin','sunflower','caliptus','pine'
];
const food = [
  'rice','pasta','chicken','pizza','bread','banana','fish','cookies','posho','potato','cassava'
];
const vehicles = [
  'car','rail','bicycle','plane','rocket','boat','ferry','bike','ship'
];
const insects = [
  'spider','cockroach','ant','bee','wasp','housefly','butterfly','grasshopper'
];
const peopleNames = [
 'john','albert','juliet','emily','jude','peter','sarah','mary','tonny','jack','joseph','moses','cathy','angel','josephine','christine'
];
const birds = [
  'dove','pigeon','hen','duck','goose','peacock','flamingo','eagle','vulture','turkey','creastedcrane','ostritch'
];

const dictionary = [
   fruits,domesticAnimals,wildAnimals,countries,plants,food,vehicles,insects,peopleNames,birds 
];

export const all = {
				fruits: dictionary[0],
				domesticAnimals: dictionary[1],
				wildAnimals: dictionary[2],
				countries: dictionary[3],
				plants: dictionary[4],
				food: dictionary[5],
				vehicles: dictionary[6],
				insects: dictionary[7],
				peopleNames: dictionary[8],
				birds: dictionary[9]
}

export function lookUp(level){
				const pick = getLevels(level);
				const randPick = pick[Math.floor(Math.random() * pick.length)];
				return randPick;
}
function getLevels(level){
				const level1picks = dictionary.flat().filter(pick => pick.length < 5);
				const level2picks = dictionary.flat().filter(pick => pick.length < 5);
				const level3picks = dictionary.flat().filter(pick => pick.length <= 5);
				const level4picks = dictionary.flat().filter(pick => pick.length < 6);
				const level5picks = dictionary.flat().filter(pick => pick.length <= 6);
				const level6picks = dictionary.flat().filter(pick => pick.length < 7);
				const level7picks = dictionary.flat().filter(pick => pick.length <= 7);
				const level8picks = dictionary.flat().filter(pick => pick.length > 6);
				const level9picks = dictionary.flat().filter(pick => pick.length > 7);
				const level10picks = dictionary.flat().filter(pick => pick.length > 8);
				
				switch(level){
								case 1: return level1picks;
								break;
								case 2: return level2picks;
								break;
								case 3: return level3picks;
								break;
								case 4: return level4picks;
								break;
								case 5: return level5picks;
								break;
								case 6: return level6picks;
								break;
								case 7: return level7picks;
								break;
								case 8: return level8picks;
								break;
								case 9: return level9picks;
								break;
								case 10: return level10picks;
								break;
								default: return level1picks;
				}
}