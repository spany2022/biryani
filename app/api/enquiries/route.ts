import { business } from "@/data/business";
import { createEnquiry, newId } from "@/lib/store";
import type { Enquiry, FieldErrors } from "@/lib/types";
import { isEmail, isIsoDate, isPhone, normalisePhone, str } from "@/lib/validation";

/** Catering / bulk-order enquiries and table reservation requests. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: "Invalid request." }, { status: 400 });

  const type = body.type === "reservation" ? "reservation" : body.type === "catering" ? "catering" : null;
  if (!type) return Response.json({ error: "Invalid request." }, { status: 400 });
  if (type === "reservation" && !business.services.reservations)
    return Response.json({ error: "Reservations aren't available." }, { status: 400 });

  // Honeypot: real visitors never see or fill this field.
  if (str(body.website)) return Response.json({ id: newId("EQ") }, { status: 201 });

  const name = str(body.name, 80);
  const phone = str(body.phone, 20);
  const email = str(body.email, 120);
  const date = str(body.date, 10);
  const time = str(body.time, 5);
  const guests = Number(body.guests);
  const occasion = str(body.occasion, 60);
  const service = str(body.service, 60);
  const notes = str(body.notes, 1000);

  const errors: FieldErrors = {};
  if (name.length < 2) errors.name = "Please enter your name.";
  if (!isPhone(phone)) errors.phone = "Enter a valid 10-digit mobile number.";
  if (email && !isEmail(email)) errors.email = "Enter a valid email address, or leave it blank.";
  if (!isIsoDate(date)) errors.date = "Choose a date.";
  else if (date < new Date(Date.now() - 86_400_000).toISOString().slice(0, 10))
    errors.date = "Choose a date from today onwards.";
  if (!Number.isInteger(guests) || guests < 1 || guests > 5000) errors.guests = "Enter the number of guests.";
  if (type === "reservation") {
    if (!/^\d{2}:\d{2}$/.test(time)) errors.time = "Choose a time.";
    if (!errors.guests && guests > 20) errors.guests = "For more than 20 guests, please send a feast enquiry.";
  } else if (!service) errors.service = "Choose what you need.";
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 422 });

  const enquiry: Enquiry = {
    id: newId(type === "reservation" ? "RS" : "CT"),
    type,
    createdAt: new Date().toISOString(),
    status: "new",
    name,
    phone: normalisePhone(phone),
    ...(email ? { email } : {}),
    date,
    ...(type === "reservation" ? { time } : {}),
    guests,
    ...(occasion ? { occasion } : {}),
    ...(service ? { service } : {}),
    ...(notes ? { notes } : {}),
  };
  await createEnquiry(enquiry);
  return Response.json({ id: enquiry.id }, { status: 201 });
}
