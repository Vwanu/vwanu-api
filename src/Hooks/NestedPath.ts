    import { HookContext } from "@feathersjs/feathers";

    export default (context: HookContext) => {
        console.log('NestedPath Hook executed');
        console.log('Route params:', context.params.route);
        context.params.query = {
          ...context.params.query,
          ...context.params.route
        };
      }
