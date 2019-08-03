import { BuilderContext } from '@angular-devkit/architect';
import { Schema } from './schema';
import { json, logging } from '@angular-devkit/core';


export default async function deploy(
  engine: { run: (dir: string, options: Schema, logger: logging.LoggerApi) => Promise<void> },
  context: BuilderContext,
  projectRoot: string,
  options: Schema
) {

  if (!context.target) {
    throw new Error('Cannot execute the build target');
  }

  const configuration = options.configuration ? options.configuration : 'production'
  const overrides = {
    ...(options.baseHref && {baseHref: options.baseHref})
  };

  context.logger.info(`📦 Building "${ context.target.project }". Configuration: "${ configuration }".${ options.baseHref ? ' Your base-href: "' + options.baseHref + '"' : '' }`);

  const build = await context.scheduleTarget({
    target: 'build',
    project: context.target.project,
    configuration
  }, overrides as json.JsonObject);
  await build.result;

  await engine.run(
    projectRoot,
    options,
    context.logger as unknown as logging.LoggerApi
  );
}
