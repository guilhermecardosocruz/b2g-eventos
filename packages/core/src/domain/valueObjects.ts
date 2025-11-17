export class Email {
  private constructor(public readonly value: string) {}

  static create(raw: string): Email {
    const trimmed = raw.trim().toLowerCase();

    // Validação simples, suficiente para domínio (sem depender de libs externas)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      throw new Error("Invalid email address");
    }

    return new Email(trimmed);
  }
}

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {}

  static create(amount: number, currency: string = "BRL"): Money {
    if (!Number.isFinite(amount)) {
      throw new Error("Amount must be a finite number");
    }
    const normalized = Math.round(amount * 100) / 100;
    if (normalized < 0) {
      throw new Error("Amount must be non-negative");
    }
    return new Money(normalized, currency.toUpperCase());
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return Money.create(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new Error("Resulting amount cannot be negative");
    }
    return Money.create(result, this.currency);
  }

  private ensureSameCurrency(other: Money) {
    if (this.currency !== other.currency) {
      throw new Error("Currency mismatch");
    }
  }
}
