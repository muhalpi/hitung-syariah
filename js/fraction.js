/*
 * Hitung Syariah — Exact rational fraction utility
 * -------------------------------------------------
 * Bagian waris WAJIB disimpan sebagai pecahan rasional (numerator/denominator),
 * BUKAN floating point. Pembulatan hanya boleh terjadi di layer presentasi.
 * (Guideline §4 Perhitungan pecahan, §17 Calculation Precision Rules)
 */
(function (global) {
  'use strict';

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      [a, b] = [b, a % b];
    }
    return a || 1;
  }

  class Fraction {
    constructor(numerator = 0, denominator = 1) {
      if (denominator === 0) throw new Error('Denominator tidak boleh nol');
      // Pertahankan tanda di pembilang
      if (denominator < 0) {
        numerator = -numerator;
        denominator = -denominator;
      }
      const g = gcd(numerator, denominator);
      this.n = numerator / g;
      this.d = denominator / g;
    }

    static from(value) {
      if (value instanceof Fraction) return value;
      if (typeof value === 'number') return new Fraction(value, 1);
      throw new Error('Nilai pecahan tidak valid');
    }

    add(other) {
      other = Fraction.from(other);
      return new Fraction(this.n * other.d + other.n * this.d, this.d * other.d);
    }

    sub(other) {
      other = Fraction.from(other);
      return new Fraction(this.n * other.d - other.n * this.d, this.d * other.d);
    }

    mul(other) {
      other = Fraction.from(other);
      return new Fraction(this.n * other.n, this.d * other.d);
    }

    div(other) {
      other = Fraction.from(other);
      if (other.n === 0) throw new Error('Pembagian dengan nol');
      return new Fraction(this.n * other.d, this.d * other.n);
    }

    isZero() {
      return this.n === 0;
    }

    isPositive() {
      return this.n > 0;
    }

    equals(other) {
      other = Fraction.from(other);
      return this.n === other.n && this.d === other.d;
    }

    // perbandingan: -1 jika this < other, 0 sama, 1 jika this > other
    compare(other) {
      other = Fraction.from(other);
      const left = this.n * other.d;
      const right = other.n * this.d;
      if (left < right) return -1;
      if (left > right) return 1;
      return 0;
    }

    toNumber() {
      return this.n / this.d;
    }

    toString() {
      if (this.d === 1) return String(this.n);
      return `${this.n}/${this.d}`;
    }

    clone() {
      return new Fraction(this.n, this.d);
    }
  }

  // LCM beberapa pecahan -> untuk aul / penyamaan penyebut
  function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
  }

  Fraction.gcd = gcd;
  Fraction.lcm = lcm;

  global.HS = global.HS || {};
  global.HS.Fraction = Fraction;
})(typeof window !== 'undefined' ? window : globalThis);
