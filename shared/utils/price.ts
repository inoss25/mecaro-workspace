export function formatPrice(amount: number, locale: string, currency: string) {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
    }).format(amount);
}

//console.log(formatPrice(1500, "fr-FR", "EUR")); // 1 500,00 €
//console.log(formatPrice(1500, "en-US", "USD")); // $1,500.00
//console.log(formatPrice(1500, "ja-JP", "JPY")); // ￥1,500
/**
 * new Intl.NumberFormat("fr-SN", {
  style: "currency",
  currency: "XOF",
}).format(25000);

new Intl.NumberFormat("fr-CI", {
  style: "currency",
  currency: "XOF",
}).format(25000);
 */
