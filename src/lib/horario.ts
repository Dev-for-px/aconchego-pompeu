// Regras de horário. Dias: 0 = domingo ... 6 = sábado (fuso de Pompéu – MG).
export type Faixa = { inicio: string; fim: string; dias: number[] };
export type Horarios = { almoco: Faixa; jantar: Faixa; almoco_ate?: string };

export const HORARIOS_PADRAO: Horarios = {
  almoco: { inicio: "11:00", fim: "15:00", dias: [0, 1, 2, 3, 4, 5, 6] },
  jantar: { inicio: "18:00", fim: "00:00", dias: [0, 2, 3, 4, 5, 6] },
  almoco_ate: "15:30",
};

/** "11:00" → "11h", "15:30" → "15h30", "00:00" → "meia-noite" */
export function hora(hhmm: string) {
  if (hhmm === "00:00" || hhmm === "24:00") return "meia-noite";
  const [h, m] = hhmm.split(":");
  return `${Number(h)}h${m !== "00" ? m : ""}`;
}

const NOMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
/** [0..6] → "todos os dias" | "terça a domingo" | "segunda, quarta e sexta" */
export function descreverDias(dias: number[]) {
  const d = [...new Set(dias)].sort();
  if (d.length === 7) return "todos os dias";
  if (d.length === 0) return "fechado";
  // sequência contínua começando na segunda (1..6,0)
  const ordem = [1, 2, 3, 4, 5, 6, 0].filter((x) => d.includes(x));
  const pos = ordem.map((x) => [1, 2, 3, 4, 5, 6, 0].indexOf(x));
  const continuo = pos.every((p, i) => i === 0 || p === pos[i - 1] + 1);
  if (continuo && ordem.length >= 3) return `${NOMES[ordem[0]]} a ${NOMES[ordem.at(-1)!]}`;
  const n = ordem.map((x) => NOMES[x]);
  return n.length === 1 ? n[0] : `${n.slice(0, -1).join(", ")} e ${n.at(-1)}`;
}

export function textoFaixa(f: Faixa) {
  const dias = descreverDias(f.dias);
  return `${dias.charAt(0).toUpperCase()}${dias.slice(1)}, das ${hora(f.inicio)} ${f.fim === "00:00" ? "à" : "às"} ${hora(f.fim)}`;
}

/** Dias em que o jantar não abre (ex.: "Segunda à noite: fechado") */
export function diasSemJantar(h: Horarios) {
  return [1, 2, 3, 4, 5, 6, 0].filter((d) => !h.jantar.dias.includes(d)).map((d) => NOMES[d]);
}

/** O cardápio do almoço ainda deve aparecer agora? (some depois de `almoco_ate`) */
export function almocoNoAr(h: Horarios, data = new Date()) {
  const { minutos } = agoraEmPompeu(data);
  return minutos < min(h.almoco_ate || "15:30");
}

export const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const min = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Hora atual em Pompéu (America/Sao_Paulo), independente do fuso do aparelho. */
export function agoraEmPompeu(data = new Date()) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(data);
  const get = (t: string) => partes.find((p) => p.type === t)?.value ?? "0";
  const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { dia, minutos: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
}

/** Data de hoje em Pompéu no formato AAAA-MM-DD. */
export function hojeEmPompeu(data = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(data);
}

function dentro(f: Faixa, dia: number, minutos: number) {
  const ini = min(f.inicio);
  let fim = min(f.fim);
  if (fim === 0) fim = 24 * 60;
  return f.dias.includes(dia) && minutos >= ini && minutos < fim;
}

export type Turno = "almoco" | "noite";

export function statusAgora(h: Horarios = HORARIOS_PADRAO, data = new Date()) {
  const { dia, minutos } = agoraEmPompeu(data);
  if (dentro(h.almoco, dia, minutos)) return { aberto: true, turno: "almoco" as Turno, texto: `Aberto agora · almoço até ${h.almoco.fim}` };
  if (dentro(h.jantar, dia, minutos)) return { aberto: true, turno: "noite" as Turno, texto: "Aberto agora · pizzaria até meia-noite" };
  // Fechado: qual é o próximo turno e o que destacar
  const turno: Turno = minutos < min(h.almoco.inicio) ? "almoco" : "noite";
  let texto = "Fechado agora";
  if (minutos < min(h.almoco.inicio) && h.almoco.dias.includes(dia)) texto = `Fechado · abre às ${h.almoco.inicio.replace(":00", "h")}`;
  else if (minutos < min(h.jantar.inicio) && h.jantar.dias.includes(dia)) texto = `Fechado · pizzaria abre às ${h.jantar.inicio.replace(":00", "h")}`;
  else texto = "Fechado · abre amanhã às 11h";
  return { aberto: false, turno, texto };
}
