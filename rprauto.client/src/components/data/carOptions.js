import modelsRaw from './models.json';

export const makes = [
  '',
  'BMW', 'Audi', 'Volkswagen', 'Porsche', 'Ford', 'Skoda', 'Opel', 'Toyota', 'Volvo',
  'Abarth', 'AC', 'Acura', 'Aiways', 'Aixam', 'Alfa Romeo', 'ALPINA', 'Alpine', 'Alvis', 'Ariel', 'Artega',
  'Asia Motors', 'Aston Martin', 'Austin', 'Austin Healey', 'Auto Union', 'BAIC', 'Barkas', 'Bentley',
  'Bizzarrini', 'Borgward', 'Brilliance', 'Bugatti', 'Buick', 'BYD', 'Cadillac', 'Casalini',
  'Caterham', 'Cenntro', 'Chatenet', 'Chevrolet', 'Chrysler', 'Citroën', 'Cobra', 'Corvette', 'Cupra',
  'Dacia', 'Daewoo', 'Daihatsu', 'Datsun', 'Delahaye', 'DeLorean', 'DeTomaso', 'DFSK', 'Dodge',
  'Donkervoort', 'DS Automobiles', 'e.GO', 'Elaris', 'Estrima', 'Facel Vega', 'Ferrari', 'Fiat', 'Fisker',
  'Ford', 'GAC Gonow', 'Gemballa', 'Genesis', 'GMC', 'Grecav', 'GWM', 'Hamann', 'Heinkel', 'Holden',
  'Honda', 'Hongqi', 'Horch', 'Hummer', 'Hyundai', 'INEOS', 'Infiniti', 'Invicta', 'Isuzu', 'Iveco',
  'JAC', 'Jaguar', 'Jeep', 'Jiayuan', 'KGM', 'Kia', 'Koenigsegg', 'KTM', 'Lada', 'Lamborghini', 'Lancia',
  'Land Rover', 'Landwind', 'Leapmotor', 'LEVC', 'Lexus', 'Ligier', 'Lincoln', 'Lotus', 'Lucid',
  'Lynk&Co', 'Mahindra', 'MAN', 'Maserati', 'Maxus', 'Maybach', 'Mazda', 'McLaren', 'Mercedes-Benz',
  'Messerschmitt', 'MG', 'Microcar', 'Microlino', 'MINI', 'Mitsubishi', 'Morgan', 'NIO', 'Nissan', 'NSU',
  'Oldsmobile', 'Opel', 'ORA', 'Packard', 'Pagani', 'Peugeot', 'Piaggio', 'Plymouth', 'Polestar',
  'Pontiac', 'Porsche', 'Proton', 'Renault', 'Riley', 'Rolls-Royce', 'Rover', 'Ruf', 'Saab', 'Santana',
  'Seat', 'Seres', 'Silence', 'Simca', 'Skoda', 'Smart', 'speedART', 'Spyker', 'Ssangyong', 'Studebaker',
  'Subaru', 'Suzuki', 'SWM', 'Talbot', 'Tata', 'TECHART', 'Tesla', 'Toyota', 'Trabant', 'Triumph', 'TVR',
  'TYN-e', 'Vincent', 'VinFast', 'Volkswagen', 'Volvo', 'Wartburg', 'Westfield', 'WEY', 'Wiesmann',
  'XEV', 'XPENG', 'Zeekr', 'Zhidou', 'Andere'
];

export const gearboxOptions = [
  { value: '', label: 'Select gearbox' },
  { value: 'Manual', label: 'Manual' },
  { value: 'Automatic', label: 'Automatic' },
  { value: 'Any', label: 'Any' }
];

export const fuelOptions = [
  { value: '', label: 'Select fuel type' },
  { value: 'Petrol', label: 'Petrol' },
  { value: 'Diesel', label: 'Diesel' },
  { value: 'Electric', label: 'Electric' },
  { value: 'Hybrid', label: 'Hybrid' }
];

export const mileageOptions = [
  { value: '', label: 'Select mileage' },
  { value: '0-10000', label: '0 - 10,000 km' },
  { value: '10001-25000', label: '10,001 - 25,000 km' },
  { value: '25001-50000', label: '25,001 - 50,000 km' },
  { value: '50001-75000', label: '50,001 - 75,000 km' },
  { value: '75001-100000', label: '75,001 - 100,000 km' },
  { value: '100001+', label: '100,001+ km' }
];

export const endingInOptions = [
  { value: 'any', label: 'Any' },
  { value: '1h', label: '1 hour' },
  { value: '12h', label: '12 hours' },
  { value: '1d', label: '1 day' },
  { value: '3d', label: '3 days' },
  { value: '1w', label: '1 week' }
];

// Build a map for fast lookup: { make: [model, ...] }
const makeToModels = {};
for (const { make, model } of modelsRaw) {
  if (!makeToModels[make]) makeToModels[make] = [];
  makeToModels[make].push(model);
}

export function getModelsForMake(make) {
  return makeToModels[make] || [];
} 