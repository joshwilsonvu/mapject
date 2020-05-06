type K = string | number;
type IterableRecord<V> = Record<K, V> & Iterable<[K, V]>;

let proxies = new WeakMap<object, Map<K, any>>();
const proto = Object.create(null);

export default Mapject;

function Mapject<V>(): IterableRecord<V>;
function Mapject<V>(obj: Record<K, V>): IterableRecord<V>;
function Mapject<V>(map: Map<K, V>): IterableRecord<V>;
function Mapject<V = any>(maplike: Record<K, V> | Map<K, V> = new Map()) {
  const map: Map<K, V> = maplike instanceof Map ? maplike : new Map(entries(maplike));
  let proxy = new Proxy(map, {
    get(map: Map<K, V>, key: K | symbol) {
      // get Symbol keys from underlying map
      if (key && key.constructor === Symbol) {
        let val = Reflect.get(map, key);
        if (typeof val === "function") {
          val = val.bind(map);
        }
        return val;
      }
      return map.get(key as K);
    },
    set(map: Map<K, V>, key: K, vValue: any) {
      map.set(key, vValue);
      return true;
    },
    deleteProperty(map: Map<K, V>, key: K) {
      return map.delete(key);
    },
    ownKeys(map: Map<K, V>) {
      return Array.from(map.keys());
    },
    has(map: Map<K, V>, key: K) {
      return map.has(key);
    },
    defineProperty(map: Map<K, V>, key: K, oDesc: PropertyDescriptor) {
      if (oDesc && "value" in oDesc && Reflect.isExtensible(map)) {
        map.set(key, oDesc.value);
        return true;
      }
      return false;
    },
    getOwnPropertyDescriptor(map: Map<K, V>, key: K) {
      return map.has(key)
        ? {
          value: map.get(key),
          writable: true,
          enumerable: true,
          configurable: true,
        }
        : undefined;
    },
    getPrototypeOf() {
      return proto;
    },
    setPrototypeOf() {
      return false;
    }
  });
  proxies.set(proxy, map);
  return (proxy as unknown) as IterableRecord<V>;
}
Mapject.getMap = <V>(proxy: Record<K, V>) => {
  const map = proxies.get(proxy);
  return map as Map<K, V> | undefined;
}
Mapject.size = (proxy: Record<K, any>) => {
  return Mapject.getMap(proxy)?.size;
};

function entries<V = any>(obj: Record<K, V>) {
  return Object.keys(obj).map(key => [key, obj[key]] as [K, V]);
}

