import { PlatformAccessory, Service, Characteristic } from 'homebridge';
import { ViessmannPlatform } from '../platform';
import { Feature } from '../viessmann/types';

export class WaterTreatmentAccessory {
  private valveService: Service;
  private filterService: Service;

  constructor(
    private readonly platform: ViessmannPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    const { Service } = this.platform.api.hap;

    this.valveService =
      accessory.getService(Service.Valve) ??
      accessory.addService(Service.Valve, 'Regeneration');

    this.valveService.setCharacteristic(
      Characteristic.ValveType,
      Characteristic.ValveType.GENERIC_VALVE,
    );

    this.filterService =
      accessory.getService(Service.FilterMaintenance) ??
      accessory.addService(Service.FilterMaintenance, 'Salzstatus');
  }

  update(features: Feature[]): void {
    const regeneration =
      features.find(f =>
        f.feature === 'waterTreatment.regeneration.active',
      )?.properties?.value?.value === true;

    const saltLow =
      features.find(f =>
        f.feature === 'waterTreatment.consumables.salt.low',
      )?.properties?.value?.value === true;

    this.valveService.updateCharacteristic(
      Characteristic.Active,
      regeneration
        ? Characteristic.Active.ACTIVE
        : Characteristic.Active.INACTIVE,
    );

    this.filterService.updateCharacteristic(
      Characteristic.FilterChangeIndication,
      saltLow
        ? Characteristic.FilterChangeIndication.CHANGE_FILTER
        : Characteristic.FilterChangeIndication.FILTER_OK,
    );
  }
}
