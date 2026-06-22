"use client";

import { FormEvent, useState } from "react";
import { CalendarPlus, LocateFixed, MapPinned, Save } from "lucide-react";
import { Button } from "@/components/Button";
import { Field, Input, Textarea } from "@/components/Field";
import {
  buildGoogleMapsUrl,
  buildWazeUrl
} from "@/lib/location";
import type { SerializedEvent } from "@/lib/types";

export type EventFormValues = {
  title: string;
  date: string;
  time: string;
  location: string;
  locationName: string;
  address: string;
  latitude: string;
  longitude: string;
  googleMapsUrl: string;
  wazeUrl: string;
  description: string;
  organizerName: string;
};

function formLocationText(form: EventFormValues) {
  return [form.locationName.trim(), form.address.trim()]
    .filter(Boolean)
    .join(", ");
}

type EventFormProps = {
  mode: "create" | "edit";
  initialEvent?: SerializedEvent;
  onSubmit: (values: EventFormValues) => Promise<void>;
};

function dateInputValue(date?: string) {
  if (!date) {
    return "2026-09-04";
  }

  return new Date(date).toISOString().slice(0, 10);
}

function eventToForm(event?: SerializedEvent): EventFormValues {
  return {
    title: event?.title ?? "אירוע של נועה ועידו",
    date: dateInputValue(event?.date),
    time: event?.time ?? "19:30",
    location: event?.location ?? "",
    locationName: event?.locationName ?? "גן אורנים",
    address: event?.address ?? event?.location ?? "השרון",
    latitude: event?.latitude?.toString() ?? "",
    longitude: event?.longitude?.toString() ?? "",
    googleMapsUrl: event?.googleMapsUrl ?? "",
    wazeUrl: event?.wazeUrl ?? "",
    description: event?.description ?? "קבלת פנים, חופה וריקודים",
    organizerName: event?.organizerName ?? "נועה ועידו"
  };
}

export function EventForm({ mode, initialEvent, onSubmit }: EventFormProps) {
  const [form, setForm] = useState<EventFormValues>(() =>
    eventToForm(initialEvent)
  );
  const [error, setError] = useState("");
  const [geoNotice, setGeoNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  function update(name: keyof EventFormValues, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onSubmit({
        ...form,
        location: formLocationText(form)
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "לא הצלחנו לשמור את האירוע"
      );
    } finally {
      setLoading(false);
    }
  }

  function useCurrentLocation() {
    setError("");
    setGeoNotice("");

    if (!navigator.geolocation) {
      setError("המכשיר או הדפדפן לא תומכים באיתור מיקום");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));

        setForm((current) => ({
          ...current,
          latitude: String(latitude),
          longitude: String(longitude),
          googleMapsUrl: buildGoogleMapsUrl(latitude, longitude),
          wazeUrl: buildWazeUrl(latitude, longitude)
        }));
        setGeoNotice("המיקום נשמר ונוצרו קישורי ניווט");
        setLocating(false);
      },
      () => {
        setError("לא התקבלה הרשאת מיקום מהדפדפן");
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000
      }
    );
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <Field label="כותרת">
        <Input
          value={form.title}
          onChange={(event) => update("title", event.target.value)}
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="תאריך">
          <Input
            type="date"
            value={form.date}
            onChange={(event) => update("date", event.target.value)}
            required
          />
        </Field>
        <Field label="שעה">
          <Input
            type="time"
            value={form.time}
            onChange={(event) => update("time", event.target.value)}
            required
          />
        </Field>
      </div>

      <section className="grid gap-4 rounded-lg bg-slate-50 p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 font-bold text-slate-950">
            <MapPinned size={18} aria-hidden="true" />
            מיקום האירוע
          </div>
          <Button
            variant="secondary"
            icon={<LocateFixed size={17} aria-hidden="true" />}
            onClick={useCurrentLocation}
            disabled={locating}
          >
            {locating ? "מאתר..." : "השתמש במיקום הנוכחי"}
          </Button>
        </div>

        <Field label="שם המקום">
          <Input
            value={form.locationName}
            onChange={(event) => update("locationName", event.target.value)}
            placeholder="לדוגמה: גן אורנים"
          />
        </Field>

        <Field label="כתובת">
          <Input
            value={form.address}
            onChange={(event) => update("address", event.target.value)}
            placeholder="אפשר להקליד כתובת ידנית"
          />
        </Field>

        <Field label="קישור Google Maps">
          <Input
            value={form.googleMapsUrl}
            dir="ltr"
            onChange={(event) => update("googleMapsUrl", event.target.value)}
            placeholder="https://www.google.com/maps?q=..."
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Latitude">
            <Input
              value={form.latitude}
              dir="ltr"
              inputMode="decimal"
              onChange={(event) => update("latitude", event.target.value)}
            />
          </Field>
          <Field label="Longitude">
            <Input
              value={form.longitude}
              dir="ltr"
              inputMode="decimal"
              onChange={(event) => update("longitude", event.target.value)}
            />
          </Field>
        </div>

        <Field label="קישור Waze">
          <Input
            value={form.wazeUrl}
            dir="ltr"
            onChange={(event) => update("wazeUrl", event.target.value)}
            placeholder="https://waze.com/ul?ll=..."
          />
        </Field>

        {geoNotice ? (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            {geoNotice}
          </div>
        ) : null}
      </section>

      <Field label="שם המארגן/ת">
        <Input
          value={form.organizerName}
          onChange={(event) => update("organizerName", event.target.value)}
          required
        />
      </Field>

      <Field label="תיאור">
        <Textarea
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
        />
      </Field>

      {error ? (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        icon={
          mode === "create" ? (
            <CalendarPlus size={18} aria-hidden="true" />
          ) : (
            <Save size={18} aria-hidden="true" />
          )
        }
        disabled={loading}
      >
        {loading
          ? "שומר..."
          : mode === "create"
            ? "שמירת אירוע והוספת אורחים"
            : "שמירת שינויים"}
      </Button>
    </form>
  );
}
