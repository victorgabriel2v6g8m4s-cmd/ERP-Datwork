export const UI_KEYS = {
  recipes: {
    page: 'recipes.page',
    headerTitle: 'recipes.header.title',
    headerSubtitle: 'recipes.header.subtitle',
    search: 'recipes.search',
    list: 'recipes.list',
    createAction: 'recipes.actions.create',
    card: 'recipes.card',
    cardStatus: 'recipes.card.status',
    cardBatchCost: 'recipes.card.batchCost',
    cardUnitCost: 'recipes.card.unitCost',
    cardYield: 'recipes.card.yield',
    createModal: 'recipes.modal.create',
    editModal: 'recipes.modal.edit',
    viewModal: 'recipes.modal.view',
    formProduct: 'recipes.form.product',
    formYield: 'recipes.form.yield',
    formIngredient: 'recipes.form.ingredient',
    formQuantity: 'recipes.form.quantity',
    formSubmit: 'recipes.form.submit',
    statusDialog: 'recipes.statusDialog',
    statusDialogTitle: 'recipes.statusDialog.title',
    statusDialogDescription: 'recipes.statusDialog.description',
    statusDialogCancel: 'recipes.statusDialog.cancel',
    statusDialogConfirm: 'recipes.statusDialog.confirm'
  }
} as const;

export type UiKey = typeof UI_KEYS.recipes[keyof typeof UI_KEYS.recipes];
