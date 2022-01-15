var game = window.game;
let toolTimeout;

function skillSelect(data){
	//checks if a skill slot is selected or not. If it's not, it will selected. If two are selected, it will trigger the movement options either place, replace, or swap

	var inventories = game.registry.get('inventories');
	var partyList = game.registry.get('partyList').split(",");
	var partyListB = game.registry.get('partyListB').split(",");
	var slot = inventories[data.target.dataset.inventoryid].slots[data.target.dataset.index];

	slot.selected ? slot.deselect() : slot.select(); 
	var itemsSelected = game.registry.get('itemsSelected')[slot.type];
	var selectedSlots = game.registry.get('selectedSlots')[slot.type] ? game.registry.get('selectedSlots')[slot.type] : [];

	if (itemsSelected == 2){

		var inventoryIdA = selectedSlots[0].inventoryId;
		var inventoryIdB = selectedSlots[1].inventoryId;
		var slotA = inventories[inventoryIdA].slots[selectedSlots[0].index];
		var slotB = inventories[inventoryIdB].slots[selectedSlots[1].index];
		var data = {'indexA':selectedSlots[0].index,'indexB':selectedSlots[1].index,'inventory':inventories[inventoryIdA]};

		//if slot index is not 0 or 1, proceed
		if (inventoryIdA == 'all-inventory' && inventoryIdB != 'all-inventory' && (slotB.index!=0 && slotB.index!=1)){
			inventories[inventoryIdB].placeItem(data);
		} else if(inventoryIdA == inventoryIdB && (slotB.index!=0 && slotB.index!=1)){
			!slotB.empty ? inventories[inventoryIdA].swapItem(data) : inventories[inventoryIdA].moveItem(data);
		} 
		
		//clear all inventory selections and save the slots. Consider adding a save button instead of auto saving
		//for (let i = 0; i < partyList.length; i++){ inventories[inventoryIdA].clearSelections(); inventories[inventoryIdB].clearSelections(); }
		for (let i = 0; i < partyListB.length; i++){ inventories[inventoryIdA].clearSelections(); inventories[inventoryIdB].clearSelections(); }

	}	else if (itemsSelected > 2){
		//clear all inventory selections and save the slots. Consider adding a save button instead of auto saving
		//for (let i = 0; i < partyList.length; i++){ inventories[inventoryIdA].clearSelections(); inventories[inventoryIdB].clearSelections(); }
		for (let i = 0; i < partyListB.length; i++){ inventories[inventoryIdA].clearSelections(); inventories[inventoryIdB].clearSelections(); }
	}
}

function clearInventoryItem(data) {
	var inventories = game.registry.get('inventories');
	var inventory = inventories[data.target.dataset.inventoryid];
	var slot = inventory.slots[data.target.dataset.index];
		slot.clearItem();
}

function activateTooltip(data){
	var inventories = game.registry.get('inventories');
	var slot = inventories[data.target.dataset.inventoryid].slots[data.target.dataset.index];
	var itemData = slot.item.itemData;
    var description = game.scene.keys['Game'].abilitiesDataDescriptions[itemData.key];
	var toolTip = document.querySelector(`#skillTooltip-dialog`);
    for (const [key, value] of Object.entries(itemData)) {
        var stat = document.querySelector(`#skillTooltip-dialog [data-${key}]`);
        if(stat && stat!=null){
            document.querySelector(`#skillTooltip-dialog [data-${key}]`).setAttribute('data-value', value);
            document.querySelector(`#skillTooltip-dialog [data-${key}] .val`).innerHTML = value;
        }
    }
    document.querySelector(`#skillTooltip-dialog .val__icon`).setAttribute('src', `src/assets/skills/${itemData.key}.png`);
    document.querySelector(`#skillTooltip-dialog .val__icon`).setAttribute('alt', itemData.name);
    document.querySelector(`#skillTooltip-dialog [data-description] .val`).innerHTML = description;
    toolTip.classList.add('active');

    cancelTimeout(toolTimeout);
    toolTimeout = setTimeout(function(){ toolTip.classList.remove('active') }, 60000);
}

function deactivateTooltip(){
	clearTimeout(toolTimeout);
	var toolTip = document.querySelector(`#skillTooltip-dialog`);
	toolTimeout = setTimeout(function(){ toolTip.classList.remove('active') }, 5000);
}

function cancelTimeout(timeout) {
  clearTimeout(timeout);
}

function draggableElement(elementSelector,options){
	interact(elementSelector).draggable({
		ignoreFrom: '.slot, .characterList, .menu-trigger',
		onmove: window.dragOnMove,
		onend: window.dragSave,
		listeners: {
			start (event) {
				console.log(event.type, event.target)
			},
		}
	})
}

function dragOnMove(event){
	var target = event.target,
	x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
    y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

	target.style.webkitTransform =
	target.style.transform = `translate(${x}px, ${y}px)`;

	target.setAttribute('data-x', x);
	target.setAttribute('data-y', y);
}

function dragSave(event){
	const target = event.target,
	x = target.getAttribute('data-x'),
	y = target.getAttribute('data-y'),
	targetID = event.target.id,
	settings = JSON.parse(localStorage.getItem('settings') ? localStorage.getItem('settings') : '{}');

	settings['ui'] = settings['ui'] || {};
	settings['ui'][event.target.id] = { 'x': x, 'y': y };
	localStorage.setItem('settings', JSON.stringify(settings));
}

function setDrag(elementSelector,options){
	const targets = document.querySelectorAll(elementSelector);
	const settings = JSON.parse(localStorage.getItem('settings') ? localStorage.getItem('settings') : '{}');
	if (!settings['ui']) settings['ui'] = {};

	for (const target of targets) {
		var targetID = target.id
		var dragPosition = settings['ui'] ? settings['ui'][targetID] : { 'x': 0, 'y': 0 };
			dragPosition = settings['ui'][targetID] || { 'x': 0, 'y': 0 };
		target.style.transform = `translate(${dragPosition.x}px, ${dragPosition.y}px)`;
		target.setAttribute('data-x', dragPosition.x);
		target.setAttribute('data-y', dragPosition.y);
	}
}

function resetDraggableElement(elementSelector,options){
	const targets = document.querySelectorAll(elementSelector);
	const dragPosition = { 'x': 0, 'y': 0 };
	for (const target of targets) {
		target.style.transform = `translate(${dragPosition.x}px, ${dragPosition.y}px)`;
		target.setAttribute('data-x', dragPosition.x);
		target.setAttribute('data-y', dragPosition.y);
		interact(elementSelector).unset();
		dragSave({'target':target});
		draggableElement(elementSelector,options);
	}
}
