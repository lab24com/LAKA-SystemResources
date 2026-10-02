# LAKA SystemResources para Zabbix

Widget de dashboard que funciona como consola NOC compacta para servidores **Windows y Linux** monitorizados con **Zabbix agent** o **Zabbix agent 2**.

- **Desarrollado** por Willian Tola
- **LAKA Soluciones Tecnológicas**  
- **Contacto:** +591 70806592

## Compatibilidad

- Zabbix frontend 7.0 LTS y 7.4.
- Plantillas oficiales `Windows by Zabbix agent` y `Linux by Zabbix agent`.
- Comprobaciones activas o pasivas.
- Zabbix agent clásico y Zabbix agent 2.

No requiere modificar las plantillas ni crear ítems adicionales.

## Idiomas

Cada instancia del widget permite seleccionar su idioma de visualización:

- Español.
- English.
- Português (Brasil).

El idioma se aplica a la consola principal, el detalle del servidor, las pestañas y los gráficos históricos.

## Consola principal

- Salud operativa: normal, advertencia, crítico, sin datos o mantenimiento.
- Problemas activos, severidad máxima y disponibilidad del agente.
- Tarjetas superiores con total, en línea, advertencias, críticos, sin datos y mantenimiento.
- Nombre del host, IP/DNS, versión del agente, CPU, vCPU, RAM, memoria total, discos, sistema operativo y uptime.
- Todos los sistemas de archivos descubiertos: `C:`, `D:`, `/`, `/var`, `/home`, etc.
- Ordenamiento por salud, servidor, CPU, vCPU, RAM, memoria, disco más ocupado, problemas y uptime.
- Filtros rápidos por salud, mantenimiento, Windows y Linux, combinables con el buscador.

### Alertas visuales de discos

El widget permite elegir entre dos modos:

- **Espacio libre (GB):** valores predeterminados de advertencia con menos de 20 GB y crítico con menos de 10 GB.
- **Porcentaje utilizado:** valores predeterminados de advertencia desde 75 % y crítico desde 90 %.

Los cuatro valores son modificables. En modo GB, las particiones cuyo tamaño total sea menor que el umbral de advertencia —por ejemplo `/boot`— se evalúan automáticamente por porcentaje para evitar estados críticos imposibles de resolver.

Estos umbrales controlan el color y la salud mostrados por el widget. Las notificaciones por correo, Telegram o Teams continúan dependiendo de los triggers y acciones configurados en Zabbix.

## Gráficos

CPU, vCPU, RAM, memoria total, discos, procesos y uptime son interactivos. Los gráficos ofrecen:

- Selección exacta de fecha y hora desde/hasta.
- Accesos rápidos de 1 h, 6 h, 24 h, 7 d y 30 d.
- Último valor, promedio, mínimo y máximo.
- Lectura automática desde history o trends según el período.
- Área coloreada bajo la curva para representar visualmente el recurso consumido.
- Etiqueta del valor actual junto al último punto de la gráfica.
- Tooltip con fecha y valor exactos, cursor vertical y zoom seleccionando un tramo con el mouse.

Al seleccionar un disco, se muestra una gráfica tipo dona con espacio utilizado y disponible, las cifras de usado, libre y total, y debajo su evolución histórica.

Al seleccionar RAM se muestran el porcentaje actual, memoria utilizada y memoria total. Para CPU se muestran el porcentaje actual, procesadores lógicos y capacidad disponible.

## Consola detallada del servidor

Al pulsar el nombre de un servidor se abre una ventana con seis pestañas:

- **Resumen:** CPU, RAM, memoria, procesos, uptime, IP, agente, sistema operativo y grupos.
- **Discos:** unidad o punto de montaje, porcentaje, usado, libre, total e histórico.
- **Red:** interfaces descubiertas, tráfico de entrada/salida, velocidad, errores y estado.
- **Servicios:** servicios Windows o unidades systemd descubiertos por las plantillas vinculadas.
- **Problemas:** severidad, duración, reconocimiento y supresión de problemas activos.
- **Rendimiento:** comparación CPU/RAM para 1 h, 6 h, 24 h, 7 d o 30 d.

## Claves oficiales utilizadas

| Recurso | Clave principal |
|---|---|
| Disponibilidad | `agent.ping` |
| Versión del agente | `agent.version` |
| CPU | `system.cpu.util` |
| CPU Linux | `system.cpu.num` |
| CPU Windows | `wmi.get[root/cimv2,"Select NumberOfLogicalProcessors from Win32_ComputerSystem"]` |
| RAM utilizada | `vm.memory.util` y compatibilidad con `vm.memory.utilization` |
| RAM total | `vm.memory.size[total]` |
| Sistema operativo | `system.sw.os` y respaldo `system.uname` |
| Uptime | `system.uptime` |
| Procesos | `proc.num` o `proc.num[]` |
| Sistemas de archivos | `vfs.fs.dependent.size[FS,pused|used|free|total]` |
| Red | `net.if.in`, `net.if.out`, `net.if.speed`, `net.if.errors`, `net.if.status` |
| Servicios | `service.info[...,state]` y `systemd.unit.info[...,ActiveState]` |

También reconoce `vfs.fs.size[FS,...]` como respaldo.

## Instalación en Rocky Linux / RHEL

Si existe una versión anterior en la carpeta `systemresources`, deshabilítela y mueva esa carpeta fuera del directorio de módulos antes de instalar. No deben quedar dos carpetas con el mismo identificador interno.

```bash
unzip -o LAKA_SystemResources100.zip -d /usr/share/zabbix/ui/modules/
find /usr/share/zabbix/ui/modules/LAKA_SystemResources -type d -exec chmod 755 {} \;
find /usr/share/zabbix/ui/modules/LAKA_SystemResources -type f -exec chmod 644 {} \;
restorecon -Rv /usr/share/zabbix/ui/modules/LAKA_SystemResources
```

Después:

1. Abra **Administración → General → Módulos**.
2. Pulse **Escanear directorio**.
3. Habilite o actualice **LAKA SystemResources**.
4. Recargue completamente el navegador con `Ctrl + F5`.

No es obligatorio asignar el propietario `www-data`; ese usuario normalmente no existe en Rocky Linux. El frontend solo necesita permisos de lectura.

## Opciones

- Grupos de hosts y hosts concretos.
- Idioma del widget: español, inglés o portugués de Brasil.
- Windows y Linux, solo Windows o solo Linux.
- Límite de 1 a 500 servidores.
- Tiempo para considerar un equipo sin datos.
- Umbrales porcentuales independientes para CPU/RAM y discos.
- Alertas de disco por espacio libre en GB o porcentaje utilizado.
- Inclusión de equipos en mantenimiento.
- Tablas separadas por sistema operativo o tabla unificada.

## Diagnóstico rápido

Si un servidor no aparece, verifique en **Monitoreo → Últimos datos** que tenga al menos `agent.ping`, `system.cpu.util` o `system.uptime`.

Si no aparecen discos, confirme que **Mounted filesystem discovery** creó los ítems `vfs.fs.dependent.size[...,pused]`.

Las pestañas Red y Servicios muestran exclusivamente los ítems descubiertos y permitidos para el usuario. Si una pestaña está vacía, revise que la plantilla correspondiente tenga habilitado ese descubrimiento.

Si un gráfico no presenta un período antiguo, confirme que la retención de history/trends cubra las fechas solicitadas.

## Seguridad y rendimiento

- Todas las consultas usan la API interna de Zabbix y respetan los permisos del usuario conectado.
- Solo se grafican ítems numéricos visibles para el usuario.
- El rango máximo por consulta es un año.
- Los gráficos agregan hasta 900 muestras para evitar respuestas excesivas.
- El detalle de red y servicios se consulta únicamente al abrir un host.
- No usa tokens, credenciales externas ni consultas directas a la base de datos.

## Versión

`1.0.0` — edición corporativa LAKA, interfaz trilingüe y alertas visuales de discos configurables por espacio libre en GB o porcentaje utilizado.
