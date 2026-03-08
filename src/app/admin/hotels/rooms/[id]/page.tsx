import { notFound } from 'next/navigation';
import { getRoomTypeById, updateRoomType } from '@/lib/supabase/hotels';
import { RoomTypeForm } from '../room-type-form';

export default async function EditRoomTypePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const roomType = await getRoomTypeById(params.id);

  if (!roomType) {
    notFound();
  }

  const update = async (formData: FormData) => {
    'use server';

    const getStr = (key: string) => String(formData.get(key) || '').trim();
    const getNum = (key: string) => {
      const raw = getStr(key);
      if (!raw) return null;
      const val = Number(raw);
      return Number.isFinite(val) ? val : null;
    };

    const name = getStr('name');
    const slug = getStr('slug');
    const description = getStr('description');
    const maxAdults = Number(getStr('maxAdults') || 0);
    const maxChildren = Number(getStr('maxChildren') || 0);
    const isActive = formData.get('isActive') === 'on';

    if (!name) {
      throw new Error('Room name is required.');
    }

    const bedsJson = getStr('bedsJson') || '{}';
    let beds: Record<string, unknown> = {};
    try {
      beds = JSON.parse(bedsJson) as Record<string, unknown>;
    } catch {
      beds = {};
    }

    const amenities = formData
      .getAll('amenities')
      .map(String)
      .map((v) => v.trim())
      .filter(Boolean);

    const services = formData
      .getAll('services')
      .map(String)
      .map((v) => v.trim())
      .filter(Boolean);

    const highlights = formData
      .getAll('highlights')
      .map(String)
      .map((v) => v.trim())
      .filter(Boolean);

    const existingImages = formData
      .getAll('existingImages')
      .map(String)
      .map((v) => v.trim())
      .filter(Boolean);

    const images = formData
      .getAll('images')
      .filter((v): v is File => typeof v === 'object' && 'name' in v && 'size' in v)
      .filter((f) => f.size > 0);

    await updateRoomType({
      id: roomType.id,
      hotelId: roomType.hotelId,
      name,
      slug: slug || roomType.slug,
      description: description || undefined,
      maxAdults: Number.isFinite(maxAdults) ? maxAdults : 0,
      maxChildren: Number.isFinite(maxChildren) ? maxChildren : 0,
      sizeSqm: getNum('sizeSqm'),
      view: getStr('view') || null,
      bathrooms: getNum('bathrooms'),
      floor: getNum('floor'),
      basePricePerNight: getNum('basePricePerNight'),
      currency: getStr('currency') || null,
      defaultUnits: getNum('defaultUnits'),
      smokingAllowed: formData.get('smokingAllowed') === 'on',
      refundable: formData.get('refundable') === 'on',
      breakfastIncluded: formData.get('breakfastIncluded') === 'on',
      petsAllowed: formData.get('petsAllowed') === 'on',
      extraBedAllowed: formData.get('extraBedAllowed') === 'on',
      extraBedFee: getNum('extraBedFee'),
      cancellationPolicy: getStr('cancellationPolicy') || undefined,
      beds,
      amenities,
      services,
      highlights,
      images: [...existingImages, ...images],
      isActive,
    });
  };

  return (
    <RoomTypeForm mode="edit" backHref="/admin/hotels/rooms" action={update} initial={roomType} />
  );
}
