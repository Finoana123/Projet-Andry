import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

function authenticate(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Error('Non autorisé');
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  try { authenticate(req); } catch (err) { return res.status(401).json({ message: err.message }); }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('students')
      .select('id, first_name, last_name, matricule, niveau, created_at')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { first_name, last_name, matricule, niveau } = req.body;
    if (!first_name || !last_name || !matricule || !niveau)
      return res.status(400).json({ message: 'Tous les champs sont requis' });

    const { data: existing } = await supabase
      .from('students')
      .select('id')
      .eq('matricule', matricule)
      .maybeSingle();
    if (existing) return res.status(409).json({ message: 'Ce matricule existe déjà' });

    const { data, error } = await supabase
      .from('students')
      .insert([{ first_name, last_name, matricule, niveau }]);
    if (error) return res.status(500).json({ message: error.message });
    return res.status(201).json({ success: true, data });
  }

  if (req.method === 'PUT') {
    const { id, first_name, last_name, matricule, niveau } = req.body;
    if (!id) return res.status(400).json({ message: 'ID requis' });
    // Vérifier que le matricule n'est pas déjà utilisé par un autre élève
    if (matricule) {
      const { data: dup } = await supabase
        .from('students')
        .select('id')
        .eq('matricule', matricule)
        .neq('id', id)
        .maybeSingle();
      if (dup) return res.status(409).json({ message: 'Ce matricule est déjà utilisé' });
    }
    const { error } = await supabase
      .from('students')
      .update({ first_name, last_name, matricule, niveau })
      .eq('id', id);
    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'ID requis' });
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
}
