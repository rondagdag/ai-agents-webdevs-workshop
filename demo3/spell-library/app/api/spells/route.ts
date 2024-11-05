// app/api/spells/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const spellDataFile = path.join(process.cwd(), 'spellData.json');

export async function GET() {
  const spellData = JSON.parse(fs.readFileSync(spellDataFile, 'utf8'));
  return NextResponse.json(spellData);
}

export async function POST(request: Request) {
  const spellData = JSON.parse(fs.readFileSync(spellDataFile, 'utf8'));
  const newSpell = await request.json();
  newSpell.id = Date.now();
  spellData.push(newSpell);
  fs.writeFileSync(spellDataFile, JSON.stringify(spellData, null, 2));
  return NextResponse.json(newSpell, { status: 201 });
}
