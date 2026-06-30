import {
  Smartphone, Car, Home, KeyRound, Tv, Bike, Factory, Wrench, Briefcase,
  PawPrint, Sofa, Shirt, BookOpen, Baby, Tag, Boxes,
} from 'lucide-react';

// Maps the server's category.icon string to a lucide icon component.
const MAP = {
  smartphone: Smartphone, car: Car, home: Home, key: KeyRound, tv: Tv, bike: Bike,
  factory: Factory, wrench: Wrench, briefcase: Briefcase, paw: PawPrint, sofa: Sofa,
  shirt: Shirt, book: BookOpen, baby: Baby, tag: Tag,
};

export function categoryIcon(name) {
  return MAP[name] || Boxes;
}
