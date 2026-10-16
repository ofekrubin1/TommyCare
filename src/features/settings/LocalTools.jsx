import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Only in the local test environment (5173): sample data (users ofek / maayan / guest) or a clean start.
export function LocalTools() {
  const load = async () => {
    const [{ buildSampleData }, { replaceAll }] = await Promise.all([import('@/data/local/seed'), import('@/data/local/localBackend')]);
    replaceAll(buildSampleData());
  };
  const clear = async () => (await import('@/data/local/localBackend')).replaceAll({});
  return (
    <Card className="space-y-3 border-dashed border-accent/50">
      <SectionTitle>סביבת בדיקה (5173)</SectionTitle>
      <p className="text-sm text-mute">הנתונים כאן נשמרים רק בדפדפן הזה ולא מגיעים ל-Firebase. כניסה עם כל שם משתמש וכל סיסמה: ofek (בעלים), maayan (עריכה), guest (צפייה), או שם חדש (ממתין לאישור).</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="soft" onClick={load}>טעינת נתוני דוגמה</Button>
        <Button variant="danger" onClick={clear}>מחיקת הכל</Button>
      </div>
    </Card>
  );
}
