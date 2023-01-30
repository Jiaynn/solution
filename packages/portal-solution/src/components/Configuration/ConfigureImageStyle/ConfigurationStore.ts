import { makeAutoObservable } from 'mobx';

class ConfigurationStore {
	isFristVisit: boolean = false;
	constructor() {
		makeAutoObservable(this);
	}
	setIsFristVisit(value: boolean) {
		this.isFristVisit = value;
	}
}

export default new ConfigurationStore();
