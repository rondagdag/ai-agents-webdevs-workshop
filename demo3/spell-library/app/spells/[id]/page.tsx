// app/spells/[id]/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Spell {
  id: number;
  name: string;
  description: string;
  pronunciation: string;
  seenMentioned: string;
  etymology: string;
  notes: string;
  knownPractitioners: string[];
  additionalItems: string;
  image: string;
}

export default function SpellDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [spell, setSpell] = useState<Spell | null>(null);

  useEffect(() => {
    const fetchSpell = async () => {
      const response = await axios.get(`/api/spells/${id}`);
      setSpell(response.data);
    };

    if (id) {
      fetchSpell();
    }
  }, [id]);

  const deleteSpell = async () => {
    await axios.delete(`/api/spells/${id}`);
    router.push('/spells');
  };

  if (!spell) return <div>Loading...</div>;

  return (
    <div>
      <h2>{spell.name}</h2>
      <p>
        <strong>Description:</strong> {spell.description}
      </p>
      <p>
        <strong>Pronunciation:</strong> {spell.pronunciation}
      </p>
      <p>
        <strong>Seen/Mentioned:</strong> {spell.seenMentioned}
      </p>
      <p>
        <strong>Etymology:</strong> {spell.etymology}
      </p>
      <p>
        <strong>Notes:</strong> {spell.notes}
      </p>
      <p>
        <strong>Known Practitioners:</strong> {spell.knownPractitioners.join(', ')}
      </p>
      <p>
        <strong>Additional Items:</strong> {spell.additionalItems}
      </p>
      <button onClick={() => router.push(`/spells/edit/${spell.id}`)}>Edit</button>
      <button onClick={deleteSpell}>Delete</button>
      <br />
      <Link href="/spells">Back to Spell List</Link>
    </div>
  );
}
