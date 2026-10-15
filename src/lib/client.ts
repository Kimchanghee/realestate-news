// Tiny DOM helpers shared by the calculator islands (vanilla TS, no framework).
import { fmtKorean, parseWon } from './calc/util.ts';

export function $(root: ParentNode, sel: string): HTMLElement | null {
  return root.querySelector(sel);
}

export function money(form: HTMLFormElement, name: string): number {
  const el = form.elements.namedItem(name) as HTMLInputElement | null;
  return el ? parseWon(el.value) : NaN;
}

export function num(form: HTMLFormElement, name: string): number {
  const el = form.elements.namedItem(name) as HTMLInputElement | null;
  if (!el || el.value.trim() === '') return NaN;
  return Number(el.value.replace(/,/g, ''));
}

export function checked(form: HTMLFormElement, name: string): boolean {
  const el = form.elements.namedItem(name) as HTMLInputElement | null;
  return !!el?.checked;
}

export function radio(form: HTMLFormElement, name: string): string {
  const el = form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
  return el?.value ?? '';
}

export function out(root: ParentNode, key: string, text: string) {
  root.querySelectorAll<HTMLElement>(`[data-out="${key}"]`).forEach((n) => (n.textContent = text));
}

export function show(root: ParentNode, key: string, visible: boolean) {
  root.querySelectorAll<HTMLElement>(`[data-show="${key}"]`).forEach((n) => (n.hidden = !visible));
}

export function clearErrors(form: HTMLFormElement) {
  form.querySelectorAll('[aria-invalid="true"]').forEach((n) => n.removeAttribute('aria-invalid'));
  form.querySelectorAll<HTMLElement>('.err').forEach((n) => (n.textContent = ''));
}

export function fieldError(form: HTMLFormElement, field: string, message: string) {
  const el = form.elements.namedItem(field) as HTMLInputElement | null;
  if (el) {
    el.setAttribute('aria-invalid', 'true');
    const e = document.getElementById(`${el.id}-err`);
    if (e) e.textContent = message;
  }
}

/** Live "= 5억원" reading under each money input. */
export function moneyEcho(form: HTMLFormElement) {
  form.querySelectorAll<HTMLInputElement>('input[data-money]').forEach((el) => {
    const echo = document.getElementById(`${el.id}-echo`);
    const upd = () => {
      if (!echo) return;
      const v = parseWon(el.value);
      echo.textContent = Number.isFinite(v) && v > 0 ? `= ${fmtKorean(v)}` : '예: 5억, 3억 2천만, 450000000';
    };
    el.addEventListener('input', upd);
    upd();
  });
}

/** Wire a form: recompute on every input; mark state for styling; report tool use once. */
export function wire(form: HTMLFormElement, tool: string, compute: () => void) {
  moneyEcho(form);
  let touched = false;
  const run = () => {
    compute();
    if (touched) (window as any).trackTool?.(tool);
  };
  form.addEventListener('input', () => {
    touched = true;
    run();
  });
  form.addEventListener('change', () => {
    touched = true;
    run();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    touched = true;
    run();
  });
  run();
}
