export enum ConnectorCategory {
    Crm = 'crm',
    Accounting = 'accounting',
    Ticketing = 'ticketing',
    MarketingAutomation = 'marketingautomation',
    FileStorage = 'filestorage',
    Productivity = 'productivity',
    Ecommerce = 'ecommerce'
}

export let categoriesVerticals: ConnectorCategory[] = Object.values(ConnectorCategory);
