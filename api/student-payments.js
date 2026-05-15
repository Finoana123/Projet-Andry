import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function authenticate(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Error('Non autorisé');
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  try { authenticate(req); } catch (err) { return res.status(401).json({ message: err.message }); }

  if (req.method !== 'GET') return res.status(405).json({ message: 'Méthode non autorisée' });

  const { student_id } = req.query;
  if (!student_id) return res.status(400).json({ message: 'student_id requis' });

  const { data, error } = await supabase
    .from('payments')
    .select('month, amount, payment_date')
    .eq('student_id', student_id)
    .eq('paid', true)
    .order('month', { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  return res.status(200).json(data);
}
