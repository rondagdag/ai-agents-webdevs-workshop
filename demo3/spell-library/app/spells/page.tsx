// app/spells/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface Spell {
  id: number;
  name: string;
  image: string;
}

export default function SpellList() {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSpells();
  }, []);

  const fetchSpells = async () => {
    const response = await axios.get('/api/spells');
    setSpells(response.data);
  };

  const handleSearch = async () => {
    const response = await axios.get('/api/spells');
    const filteredSpells = response.data.filter((spell: Spell) =>
      spell.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSpells(filteredSpells);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search spells..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <table>
        <thead>
          <tr>
        <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {spells.map((spell) => (
        <tr key={spell.id}>
          <td>
            <Link href={`/spells/${spell.id}`}>
          {spell.name}
            </Link>
          </td>
        </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
