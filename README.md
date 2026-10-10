# Bedside Sky Card

A bedside screen for Home Assistant, made for a 960×480 [View Assist](https://github.com/dinki/View-Assist) display such as a jailbroken Echo Show 5.

It shows a big clock over a live sky that follows the real sunrise, sunset and weather, with drifting clouds and rain. Swipe sideways for more pages:

- **Home:** clock, date and weather, Today card, ceiling light and alerts.
- **House:** lights, room climate, laundry, leak sensors and shopping list.
- **Music:** now playing, transport controls and volume.
- **Front door:** camera stills and recent detections.
- **Settings:** the display's brightness, volume, do not disturb, auto brightness and wake word.

How it behaves:

- **Night:** from bedtime until the alarm, the screen goes black with a dim clock.
- **Alarm:** hold the clock to open the alarm.
- **Forecast:** tap the top of the Today card for the full forecast.
- **Ceiling presets:** hold the ceiling light for its presets (placeholders for now).
- **Doorbell:** a ring brings up the Front door page for a minute, even at night. A person detected at the door does the same, but only during the day.

## Install

1. In HACS, open the menu (⋮) and choose **Custom repositories**.
2. Add this repository's URL with the type **Dashboard**.
3. Find **Bedside Sky Card** in HACS and download it.
4. Reload the browser.

HACS adds the dashboard resource for you. The card's type is `custom:bedside-sky-card`.

## Set up

Put the card in a **panel** view, so it fills the screen, and point the display at that view. On a View Assist device, that view goes in the View Assist dashboard and becomes the device's home screen.

```yaml
type: custom:bedside-sky-card
device: bedroom            # VACA device name: fills in mute, brightness, volume, DND, auto brightness, wake word
ceiling:
  - light.bedroom_ceiling_1
  - light.bedroom_ceiling_2
lamp: light.bedroom_lamp
hall: light.hall
hood: light.kitchen_hood
weather: weather.forecast_home
alarm_time: input_datetime.bedside_alarm   # a time-only helper
alarm_on: input_boolean.bedside_alarm
temperature: sensor.hall_temperature
humidity: sensor.hall_humidity
laundry_door: binary_sensor.laundry_door
washer_power: sensor.washer_plug_power
leaks:
  - entity: binary_sensor.kitchen_sink_leak
    name: Kitchen sink
shopping: todo.shopping_list
music: media_player.spotify
camera: camera.front_door
doorbell: binary_sensor.front_door_ring
person: binary_sensor.front_door_person
camera_events:
  - { entity: binary_sensor.front_door_ring, name: Doorbell, icon: bell }
  - { entity: binary_sensor.front_door_person, name: Person, icon: person }
  - { entity: binary_sensor.front_door_vehicle, name: Car, icon: car }
  - { entity: binary_sensor.front_door_motion, name: Motion, icon: motion }
alerts:
  - entity: binary_sensor.laundry_door
    text: Laundry door is open
  - entity: binary_sensor.kitchen_sink_leak
    text: Water under the kitchen sink
```

Every option can be left out. A page with nothing set up is hidden.

| Option | What it does |
| --- | --- |
| `device` | View Assist Companion App device name, e.g. `bedroom` for `switch.vaca_bedroom_mute`. Fills in `mute`, `do_not_disturb`, `auto_brightness`, `brightness`, `volume` and `wake_word`. Set any of these yourself to override, or to `''` to turn it off. |
| `ceiling`, `lamp`, `hall`, `hood` | Lights or switches (one entity or a list). `ceiling` is also the big button on Home. |
| `weather` | Weather entity. Hourly and daily forecasts are used when it has them. |
| `sun` | Default `sun.sun`. The sky's sunrise and sunset come from it. |
| `alarm_time`, `alarm_on` | `input_datetime` (time only) and `input_boolean` for the alarm. Repeat days and the sunrise option are kept on the device. |
| `bedtime` | When night starts, default `"22:30"`. Night ends at the alarm time. |
| `calendar` | Calendar for the Next line. Without one, that line shows the alarm. |
| `temperature`, `humidity`, `laundry_door`, `washer_power`, `leaks`, `shopping` | The House page's sensors. `washer_running_watts` (default 5) decides when the washer counts as running. |
| `music` | Media player for the Music page. |
| `camera`, `camera_name`, `camera_refresh`, `camera_width` | Camera for the Front door page. It shows a still every `camera_refresh` seconds (default 2), `camera_width` pixels wide (default 640). |
| `doorbell`, `person` | Binary sensors that bring up the Front door page. |
| `camera_events` | The Recent list. Icons: `bell`, `person`, `motion`, `car`, `animal`. |
| `alerts` | Binary sensors that raise an alert while on, with the text to show. The first alert to start stays at the top. |
| `pages` | Page order, e.g. `[home, house, cams]`. |
| `id` | Keeps the alarm days separate when two cards share a browser. |

## Notes

- The alarm rings on screen only. Sound is not wired up yet.
- **Sounds** and the ceiling light presets are placeholders.
- The sky is drawn on the device. On slow hardware it redraws less often to keep up.
- To mute the mic, use a gesture: an automation can toggle `switch.vaca_<device>_mute` on a two-finger swipe down (`event.vaca_<device>_gesture`). One-finger swipes stay free for the pages.

MIT License.
