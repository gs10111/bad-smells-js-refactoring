const PRIORITY_THRESHOLD = 1000;
const USER_VALUE_LIMIT = 500;

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  generateReport(reportType, user, items) {
    let report = this._buildHeader(reportType, user);
    let total = 0;

    for (const item of items) {
      this._applyAdminRules(item, user);
      if (this._isItemVisible(item, user)) {
        report += this._formatRow(reportType, item, user);
        total += item.value;
      }
    }

    report += this._buildFooter(reportType, total);
    return report.trim();
  }

  /** Marks high-value items as priority when the user is an admin. */
  _applyAdminRules(item, user) {
    if (user.role === 'ADMIN' && item.value > PRIORITY_THRESHOLD) {
      item.priority = true;
    }
  }

  /** Returns true if the user is allowed to see the item. */
  _isItemVisible(item, user) {
    if (user.role === 'ADMIN') return true;
    if (user.role === 'USER') return item.value <= USER_VALUE_LIMIT;
    return false;
  }

  /** Builds the report header section. */
  _buildHeader(reportType, user) {
    if (reportType === 'CSV') {
      return 'ID,NOME,VALOR,USUARIO\n';
    }
    if (reportType === 'HTML') {
      return (
        '<html><body>\n' +
        '<h1>Relatório</h1>\n' +
        `<h2>Usuário: ${user.name}</h2>\n` +
        '<table>\n' +
        '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n'
      );
    }
    return '';
  }

  /** Builds the report footer section. */
  _buildFooter(reportType, total) {
    if (reportType === 'CSV') {
      return `\nTotal,,\n${total},,\n`;
    }
    if (reportType === 'HTML') {
      return '</table>\n' + `<h3>Total: ${total}</h3>\n` + '</body></html>\n';
    }
    return '';
  }

  /** Delegates row formatting to the format-specific method. */
  _formatRow(reportType, item, user) {
    if (reportType === 'CSV') return this._formatCsvRow(item, user);
    if (reportType === 'HTML') return this._formatHtmlRow(item);
    return '';
  }

  /** Formats a single data row as CSV. */
  _formatCsvRow(item, user) {
    return `${item.id},${item.name},${item.value},${user.name}\n`;
  }

  /** Formats a single data row as HTML, applying bold styling for priority items. */
  _formatHtmlRow(item) {
    const style = item.priority ? ' style="font-weight:bold;"' : '';
    return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }
}
