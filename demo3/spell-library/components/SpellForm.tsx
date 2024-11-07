// components/SpellForm.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";

interface SpellFormProps {
  isEditMode: boolean;
  spellId?: number;
}

export default function SpellForm({ isEditMode, spellId }: SpellFormProps) {
  interface SpellData {
    name: string;
    description: string;
    pronunciation: string;
    seenMentioned: string;
    etymology: string;
    notes: string;
    knownPractitioners: string;
    additionalItems: string;
    image: string;
  }

  const [spellData, setSpellData] = useState<SpellData>({
    name: '',
    description: '',
    pronunciation: '',
    seenMentioned: '',
    etymology: '',
    notes: '',
    knownPractitioners: '',
    additionalItems: '',
    image: '',
  });


  useCopilotReadable({
    description: "The spell data",
    value: spellData,
  });

//  const [imageFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSpell = async () => {
      const response = await axios.get(`/api/spells/${spellId}`);
      const spell = response.data;
      setSpellData({
        ...spell,
        knownPractitioners: spell.knownPractitioners.join(', '),
      });
    };

    if (isEditMode && spellId) {
      fetchSpell();
    }
  }, [isEditMode, spellId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSpellData({ ...spellData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...spellData,
      knownPractitioners: spellData.knownPractitioners.split(',').map((s: string) => s.trim()),
      //image: imagePath,
    };

    if (isEditMode) {
      await axios.put(`/api/spells/${spellId}`, payload);
    } else {
      await axios.post('/api/spells', payload);
    }

    router.push('/spells');
  };

  useCopilotAction(
    {
      // Define the name of the action
      name: "createSpell",
      // Provide a description for the action
      description: "Create a Harry Potter spell",
      // Define the parameters required for the action
      parameters: [
        {
          name: "spell",
          type: "object",
          description: "a Harry Potter spell",
          attributes: [{
            name: "name",
            type: "string",
            description: "Name of the spell"
          },
          {
            name: "description",
            type: "string",
            description: "The description of the spell"
          },
          {
            name: "pronunciation",
            type: "string",
            description: "The pronunciation of the spell"
          },
          {
            name: "seenMentioned",
            type: "string",
            description: "movies where the spell was mentioned"
          },
          {
            name: "knownPractitioners",
            type: "string",
            description: "Known practictioners of the spell"
          }
        ],
        },
      ],
      // Define the handler function to be executed when the action is called
      handler: async ({ spell }) => {
        setSpellData(spell as SpellData)
      },
    },
    // Empty dependency array, indicating this effect does not depend on any props or state
    [],
  );

  return (
    <div>
      <h2>{isEditMode ? 'Edit Spell' : 'Add New Spell'}</h2>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input name="name" value={spellData.name} onChange={handleChange} required />

        <label>Description:</label>
        <textarea name="description" value={spellData.description} onChange={handleChange} required />

        <label>Pronunciation:</label>
        <input name="pronunciation" value={spellData.pronunciation} onChange={handleChange} />

        <label>Seen/Mentioned:</label>
        <textarea name="seenMentioned" value={spellData.seenMentioned} onChange={handleChange} />

        <label>Etymology:</label>
        <textarea name="etymology" value={spellData.etymology} onChange={handleChange} />

        <label>Notes:</label>
        <textarea name="notes" value={spellData.notes} onChange={handleChange} />

        <label>Known Practitioners (comma-separated):</label>
        <input name="knownPractitioners" value={spellData.knownPractitioners} onChange={handleChange} />

        <label>Additional Items:</label>
        <textarea name="additionalItems" value={spellData.additionalItems} onChange={handleChange} />

        <button type="submit">{isEditMode ? 'Update Spell' : 'Add Spell'}</button>
      </form>
      <br />
      <button onClick={() => router.back()}>Cancel</button>
    </div>
  )
}
