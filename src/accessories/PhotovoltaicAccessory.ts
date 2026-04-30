
import {
  PlatformAccessory,
  Service,
  Characteristic
} from 'homebridge';
import { ViessmannPlatform } from '../platform';
import { Feature } from '../viessmann/types';

export class PhotovoltaicAccessory {
  private lightService: Service;
  private switchService: Service;

  constructor(
    private readonly platform: ViessmannPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    const { Service } = this.platform.api.hap;

    this.lightService =
      this.accessory.getService(Service.LightSensor) ||
      this.accessory.addService(Service.LightSensor, 'PV Leistung');

    this.switchService =
      this.accessory.getService(Service.Switch) ||
      this.accessory.addService(Service.Switch, 'PV Anlage');

    this.accessory.category =
      this.platform.api.hap.Categories.SENSOR;

    this.platform.log.info(
      `PV Accessory initialisiert: ${accessory.displayName}`
    );
  }

  public update(features: Feature[]): void {
    const power = features.find(
      f => f.feature === 'photovoltaic.power.current'
    );

    if (power?.properties?.value?.value !== undefined) {
      const watts = power.properties.value.value;

      this.lightService.updateCharacteristic(
        Characteristic.CurrentAmbientLightLevel,
        Math.max(watts, 0.0001),
      );

      this.switchService.updateCharacteristic(
        Characteristic.On,
        watts > 10,
      );
    }
  }
}
