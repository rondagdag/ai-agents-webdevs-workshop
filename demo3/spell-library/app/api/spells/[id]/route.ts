/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/spells/[id]/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const spellDataFile = path.join(process.cwd(), 'spellData.json');

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const spellData = JSON.parse(fs.readFileSync(spellDataFile, 'utf8'));
  const spell = spellData.find((spell: any) => spell.id === Number(params.id));

  if (!spell) {
    return NextResponse.json({ message: 'Spell not found' }, { status: 404 });
  }

  return NextResponse.json(spell);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const spellData = JSON.parse(fs.readFileSync(spellDataFile, 'utf8'));
  const index = spellData.findIndex((spell: any) => spell.id === Number(params.id));

  if (index === -1) {
    return NextResponse.json({ message: 'Spell not found' }, { status: 404 });
  }

  const updatedSpell = await request.json();
  spellData[index] = { ...spellData[index], ...updatedSpell };
  fs.writeFileSync(spellDataFile, JSON.stringify(spellData, null, 2));

  return NextResponse.json(spellData[index]);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const spellData = JSON.parse(fs.readFileSync(spellDataFile, 'utf8'));
  const index = spellData.findIndex((spell: any) => spell.id === Number(params.id));

  if (index === -1) {
    return NextResponse.json({ message: 'Spell not found' }, { status: 404 });
  }

  spellData.splice(index, 1);
  fs.writeFileSync(spellDataFile, JSON.stringify(spellData, null, 2));

  return NextResponse.json({ message: 'Spell deleted' });
}
